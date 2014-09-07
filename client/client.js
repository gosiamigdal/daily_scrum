var users = Meteor.subscribe("allUsers");

Tracker.autorun(function () {
  if (Router.current() == null || !users.ready()) {
    return;
  }

  var route = Router.current().route.name;
  if (Meteor.user() == null) {
    if (route != 'home') {
      Router.go('home');
    }
  } else {
    var hasGroup = Meteor.user().profile.groupId != null;
    if (hasGroup) {
      if (route != 'done' && route != 'doneOn') {
        Router.go('done');
      }
    } else {
      if (route != 'setup') {
        Router.go('setup');
      }
    }
  }
});

Template._loginButtonsLoggedInDropdown.events({
  'click #login-buttons-edit-profile': function (event) {
    event.stopPropagation();
    Template._loginButtons.toggleDropdown();
    //Router.go('profileEdit');
  }
});

Accounts.ui.config({
  requestPermissions: {
    github: ['user:email']
  }
});
