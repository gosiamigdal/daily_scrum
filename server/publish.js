Meteor.publish('tasksForMonth', function (year, month) {
  if (this.userId != null) {
    var user = Meteor.users.findOne(this.userId);
    return Task.find({groupId: user.profile.groupId, year: year, month: month});
  } else {
    return [];
  }
});

Meteor.publish('usersFromMyGroup', function () {
  if (this.userId != null) {
    var user = Meteor.users.findOne(this.userId);
    return Meteor.users.find({'profile.groupId': user.profile.groupId},
      {fields: {_id: 1, profile: 1, emails: 1}});
  } else {
    return [];
  }
});

Meteor.publish('myGroup', function () {
  if (this.userId != null) {
    var user = Meteor.users.findOne(this.userId);
    return Group.find(user.profile.groupId);
  } else {
    return [];
  }
});

Meteor.publish('invitationsToMyGroup', function () {
  if (this.userId != null) {
    var user = Meteor.users.findOne(this.userId);
    return Invitation.find({groupId: user.profile.groupId});
  } else {
    return [];
  }
});

Meteor.publish('myInvitations', function () {
  if (this.userId != null) {
    var user = Meteor.users.findOne(this.userId);
    return Invitation.find({email: user.emails[0].address});
  } else {
    return [];
  }
});
