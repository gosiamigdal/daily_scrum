Session.setDefault('editing_task_item', null);
Session.setDefault('added_team_email', "");

Template.hello.groupName = function () {
  if (Meteor.user() == null) {
    return "";
  }
  var groupId = Meteor.user().profile.groupId;
  var group = Group.findOne(groupId);
  if (group == null) {
    return "";
  } else {
    return group.name;
  }
}

Template.hello.date = function () {
  var m = moment(Session.get('current_date'));
  var prefix;
  if (m.day() == moment().day() && m.year() == moment().year()) {
    prefix = "Today ";
  } else {
    prefix = "On ";
  }
  return prefix + m.format('MMM Do YYYY');
}

Template.team.invitationNumber = function () {
  if (Meteor.user() == null) {
    return 0;
  }
  var groupId = Meteor.user().profile.groupId;
  return Invitation.find({groupId: groupId}).count();
}

Template.team.invitations = function () {
  if (Meteor.user() == null) {
    return [];
  }
  var groupId = Meteor.user().profile.groupId;
  return Invitation.find({groupId: groupId}).fetch();
}

Template.team.addedEmail = function () {
  return Session.get('added_team_email');
}

var inviteNewMember = function (tmpl) {
  var email = tmpl.$('input[type="text"]').val();
  Invitation.insert({
    email: email,
    groupId: Meteor.user().profile.groupId,
    senderUserId: Meteor.userId()
  });
  Session.set('added_team_email', email);
  tmpl.$('.added-message').show().fadeOut(4000);
  tmpl.$('input[type="text"]').val("");
}

Template.team.events({
  'keyup input[type="text"]': function (e, tmpl) {
    if (e.which == 13) {
      inviteNewMember(tmpl);
    }
  },
  'click input[type="button"]': function (e, tmpl) {
    inviteNewMember(tmpl);
  }
});

Template.team.members = function () {
  if (Meteor.user() != null) {
    return Meteor.users.find({"profile.groupId":
      Meteor.user().profile.groupId}).fetch();
  } else {
    return [];
  }
}

Template.teamMember.hasAvatar = function () {
  return this.profile.avatarUrl != null;
}

Template.teamMember.avatarUrl = function () {
  return this.profile.avatarUrl;
}

Template.teamMember.name = function () {
  return this.profile.name;
}

Template.teamMember.email = function () {
  return this.emails[0].address;
}

var parseTask = function(text) {
  var timeRegex = [
    '([0-9]{1,2})h ?([0-9]{1,2})m(in)?',
    '([0-9]{1,2})h',
    '([0-9]{1,2})m(in)?'
  ]
  var extractTime = [
    function (r) { return parseInt(r[1]) * 60 + parseInt(r[2]);},
    function (r) { return parseInt(r[1]) * 60;},
    function (r) { return parseInt(r[1]);}
  ]

  var m = moment(Session.get('current_date'));
  var resultTask = {
    name: text,
    userId: Meteor.userId(),
    groupId: Meteor.user().profile.groupId,
    day: m.date(),
    month: m.month(),
    year: m.year()
  };

  for (var i = 0; i < timeRegex.length; i++) {
    var regex = new RegExp('.*?' + timeRegex[i] + '.*');
    var result = regex.exec(text);
    if (result !== null) {
      resultTask['name'] = text.replace(new RegExp(timeRegex[i]), '');
      resultTask['minutesSpent'] = extractTime[i](result);
      return resultTask;
    }
  }
  return resultTask;
}

var addTask = function() {
  var name = $('input[type="text"].new_item').val().trim();
  if (name.length > 0) {
    Task.insert(parseTask(name));
    $('input[type="text"].new_item').val('');
  } else {
    alert("Task needs some description.");
  }
}

var toHumanTime = function(rawMinutes) {
  if (Number.isInteger(rawMinutes)) {
    if (rawMinutes > 59) {
      var hours = rawMinutes / 60;
      var minutes = rawMinutes % 60;
      var result = Math.floor(hours) + "h";
      if (minutes > 0) {
        result += " " + minutes + "m";
      }
      return result;
    } else {
      return rawMinutes + "m";
    }
  } else {
    return "";
  }
}

Template.task.members = function () {
  if (Meteor.user() == null) {
    return [];
  }
  var groupId = Meteor.user().profile.groupId;
  var users = Meteor.users.find({'profile.groupId': groupId}).fetch();

  var ourPosition;
  for (var i = 0; i < users.length; i++) {
    if (users[i]._id == Meteor.userId()) {
      ourPosition = i;
      break;
    }
  }

  // swap
  var tmp = users[0];
  users[0] = users[ourPosition];
  users[ourPosition] = tmp;

  return users;
}

Template.taskDoneBy.userName = function () {
  return this.profile.name;
}

Template.taskDoneBy.task = function () {
  var m = moment(Session.get('current_date'));

  return Task.find({userId: this._id,
    day: m.date(),
    month: m.month(),
    year: m.year()}).fetch();
};


Template.taskDoneBy.hasAvatar = function () {
  return this.profile.avatarUrl != null;
}

Template.taskDoneBy.avatarUrl = function () {
  return this.profile.avatarUrl;
}

Template.task.events({
  'keyup .new_item': function () {
    if (event.which == 13) { // enter key
      addTask();
    }
  },
  'click input[type="button"]': function () {
    addTask();
  }
});

Template.taskDoneBy.humanTotalTime = function () {
  var sum = 0;
  var m = moment(Session.get('current_date'));
  Task.find({userId: this._id,
      day: m.date(),
      month: m.month(),
      year: m.year()}).forEach(function (el) {
    sum += el.minutesSpent || 0;
  });
  return toHumanTime(sum);
};

Template.taskItem.events({
  'click .remove': function () {
    var id = this._id;
    Task.remove(id);
  },
  'click .edit': function (e, tmpl) {
    Session.set('editing_task_item', this._id);
    Tracker.flush();
    var el = tmpl.$(":parent input");
    el.focus();
  },
  'keyup input': function (event) {
    if (event.which === 13) { // enter key
      var value = event.target.value;
      var updatedTask = parseTask(value);
      delete updatedTask.userId;
      delete updatedTask.groupId;
      Task.update(this._id, {$set: updatedTask});
      Session.set('editing_task_item', null);
    }
  },
  'focusout input': function () {
    Session.set('editing_task_item', null);
  }
});

Template.taskItem.editing = function () {
  return Session.equals('editing_task_item', this._id);
};

Template.taskItem.timeHours = function () {
  var hours = Math.floor(this.minutesSpent / 60);
  if (hours > 0) {
    return hours + "h";
  } else {
    return "";
  }
};

Template.taskItem.timeMinutes = function () {
  var minutes = this.minutesSpent % 60;
  if (minutes > 0) {
    return minutes + "m";
  } else {
    return "";
  }
};

Template.taskItem.isMine = function () {
  if (Meteor.userId() == this.userId) {
    return "mine";
  } else {
    return "";
  }
};

Tracker.autorun(function () {
  var user = Meteor.user(); // depend on user
  if (user != null) {
    Meteor.subscribe('usersFromMyGroup', user._id, user.profile.groupId);
    Meteor.subscribe('myGroup', user._id, user.profile.groupId);
    Meteor.subscribe('invitationsToMyGroup', user._id, user.profile.groupId);
  }
});
