var users = Meteor.subscribe('usersFromMyGroup');

Tracker.autorun(function () {
  if (Router.current() == null || !users.ready()) {
    return;
  }

  var route = Router.current().route.name;
  if (route == 'about') {
    return;
  }

  if (Meteor.user() == null) {
    if (route != 'home') {
      Router.go('home');
    }
  } else {
    if (route == 'profileEdit') {
      return;
    }
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

Template.avatar.hasAvatar = function () {
  return Meteor.user() != null && Meteor.user().profile.avatarUrl != null;
}

Template.avatar.avatarUrl = function () {
  return Meteor.user().profile.avatarUrl;
}

Template._loginButtonsLoggedInDropdown.events({
  'click #login-buttons-edit-profile': function (event) {
    Router.go('profileEdit');
  }
});

Accounts.ui.config({
  requestPermissions: {
    github: ['user:email']
  }
});
