Meteor.startup(function () {
  // code to run on server at startup
});

Task.allow({
  insert: function(userId, doc) {
    return userId != null;
  },
  update: function(userId, doc, fieldNames, modifier) {
    return doc.userId == userId;
  },
  remove: function(userId, doc) {
    return doc.userId == null || doc.userId == userId;
  }
});

Group.allow({
  insert: function(userId, doc) {
    return userId != null;
  }
});

Invitation.allow({
  insert: function(userId, doc) {
    return userId != null &&
      Meteor.users.findOne(userId).profile.groupId === doc.groupId;
  }
});

Meteor.publish("allUsers", function () {
  return Meteor.users.find();
});