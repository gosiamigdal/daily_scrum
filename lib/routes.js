Router.map(function() {
  this.route('home', {path: '/'});
  this.route('setup');
  this.route('done');
});

Router.onBeforeAction(function () {
  if (Meteor.user() != null) {
    var hasGroup = Meteor.user().profile.groupId != null;
    if (hasGroup) {
      this.redirect('done');
    } else {
      this.redirect('setup');
    }
  }
}, {only: ['home']});

Router.onBeforeAction(function () {
  if (Meteor.user() != null) {
    var hasGroup = Meteor.user().profile.groupId != null;
    if (hasGroup) {
      this.redirect('done');
    }
  } else {
    this.redirect('home');
  }
}, {only: ['setup']})

Router.onBeforeAction(function () {
  if (Meteor.user() != null) {
    var hasGroup = Meteor.user().profile.groupId != null;
    if (!hasGroup) {
      this.redirect('setup');
    }
  } else {
    this.redirect('home');
  }
}, {only: ['done']});
