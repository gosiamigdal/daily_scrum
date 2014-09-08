Session.setDefault('editing_task_item', null);
Session.setDefault('added_team_email', "");

Template.hello.groupName = function () {
  if (Meteor.user() == null) {
    return "";
  }
  var groupId = Meteor.user().profile.groupId;
  return Group.findOne(groupId).name;
}

Template.hello.date = function () {
  var m = moment(Session.get('current_date'));
  var prefix;
  if (m.day() == moment().day() && m.year() == moment().year()) {
    prefix = "today: ";
  } else {
    prefix = "on: ";
  }
  return prefix + m.format('MMM Do YYYY');
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

function parseTask(text) {
  var timeRegex = [
    '([0-9]{1,2})h ?([0-9]{1,2})m',
    '([0-9]{1,2})h',
    '([0-9]{1,2})m'
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

function addTask() {
  var name = $('input[type="text"].new_item').val();
  Task.insert(parseTask(name));
  $('input[type="text"].new_item').val('');
}

function toHumanTime(rawMinutes) {
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

Template.task.task = function () {
  if (Meteor.user() == null) {
    return [];
  }
  var groupId = Meteor.user().profile.groupId;
  var m = moment(Session.get('current_date'));

  return Task.find({groupId: groupId,
    day: m.date(),
    month: m.month(),
    year: m.year()}).fetch();
};

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

Template.task.humanTotalTime = function () {
  var sum = 0;
  var m = moment(Session.get('current_date'));
  Task.find({day: m.date(),
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
  'dblclick p': function (e, tmpl) {
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

Template.taskItem.humanTime = function () {
  return toHumanTime(this.minutesSpent);
};

Template.taskItem.owner = function () {
  var owner = Meteor.users.findOne({_id: this.userId});
  return owner && owner.profile.name;
};
