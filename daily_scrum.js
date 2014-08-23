Task = new Meteor.Collection("task");


if (Meteor.isClient) {
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
  }

  Template.task.events({
    'click input[type="button"]': function () {
      var name = $('input[type="text"]').val();
      Task.insert({name: name});
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
