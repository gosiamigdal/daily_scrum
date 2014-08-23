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

  Template.task.task = function () {
    return Task.find().fetch();
  };

  Template.task.events({
    'click input[type="button"]': function () {
      var name = $('input[type="text"].new_item').val();
      Task.insert({name: name});
    }
  });

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
        Task.update(this._id, {$set: {name: value}});
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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
