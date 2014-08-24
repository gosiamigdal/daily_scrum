Task = new Meteor.Collection("task");


if (Meteor.isClient) {
  Session.setDefault('editing_task_item', null);

  Template.hello.greeting = function () {
    return "Welcome to daily_scrum.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });


  function parseTask(text) {
    var timeRegex = [
      "([0-9]{1,2})h ?([0-9]{1,2})m",
      "([0-9]{1,2})h",
      "([0-9]{1,2})m"
    ]
    var extractTime = [
      function (r) { return parseInt(r[1]) * 60 + parseInt(r[2]);},
      function (r) { return parseInt(r[1]) * 60;},
      function (r) { return parseInt(r[1]);}
    ]

    for (var i = 0; i < timeRegex.length; i++) {
      var regex = new RegExp(".*?" + timeRegex[i] + ".*");
      var result = regex.exec(text);
      if (result !== null) {
        return {
          name: text.replace(new RegExp(timeRegex[i]), ""),
          minutes: extractTime[i](result)};
      }
    }

    return {name: text};
  }

  function addTask() {
    var name = $('input[type="text"].new_item').val();
    Task.insert(parseTask(name));
    $('input[type="text"].new_item').val("");
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
    return Task.find().fetch();
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
    Task.find().forEach(function (el) {
      sum += el.minutes || 0;
    });
    return toHumanTime(sum);
  };

  Template.task_item.events({
    'click .remove': function () {
      var id = this._id;
      Task.remove(id);
    },
    'dblclick p': function (e, tmpl) {
      Session.set('editing_task_item', this._id);
      Deps.flush();
      var el = tmpl.$(":parent input");
      el.focus();
    },
    'keyup input': function (event) {
      if (event.which === 13) { // enter key
        var value = event.target.value;
        Task.update(this._id, {$set: parseTask(value)});
        Session.set('editing_task_item', null);
      }
    },
    'focusout input': function() {
      Session.set('editing_task_item', null);
    }
  });

  Template.task_item.editing = function () {
    return Session.equals('editing_task_item', this._id);
  };

  Template.task_item.humanTime = function () {
    return toHumanTime(this.minutes);
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
