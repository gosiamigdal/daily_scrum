Meteor.startup(function () {
  // code to run on server at startup
});

Task.allow({
  insert: function(userId, doc) {
    return userId != null &&
      doc.userId == userId && 
      Meteor.users.findOne(userId).profile.groupId == doc.groupId;
  },
  update: function(userId, doc, fieldNames, modifier) {
    return doc.userId == userId &&
      fieldNames.indexOf("groupId") == -1 && 
      fieldNames.indexOf("userId") == -1;
  },
  remove: function(userId, doc) {
    return doc.userId == null || doc.userId == userId;
  }
});

Group.allow({
  insert: function(userId, doc) {
    return userId != null &&
      Meteor.users.findOne(userId).profile.groupId == null;
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