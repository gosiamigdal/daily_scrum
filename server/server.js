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
      doc.creatorUserId == userId &&
      Meteor.users.findOne(userId).profile.groupId == null;
  }
});

Invitation.allow({
  insert: function(userId, doc) {
    return userId != null &&
      Meteor.users.findOne(userId).profile.groupId == doc.groupId;
  }
});

Meteor.users.deny({
  update: function(userId, doc, fieldNames, modifier) {
    console.log("Meteor.users update(%s, %s, %s, %s)",
      userId, doc, fieldNames, modifier);
    function hasInvitation(newGroupId) {
      var email = Meteor.users.findOne(userId).emails[0].address;
      var foundInvitation = false;
      Invitation.find({email: email}).forEach(function(invite) {
        console.log("Meteor.users.deny update() invite '%s', newGroupId '%s'",
          invite.groupId, newGroupId);
        if (invite.groupId == newGroupId) {
          foundInvitation = true;
        }
      });
      return foundInvitation;
    }

    for (var key in modifier) {
      for (var field in modifier[key]) {
        if (field == "profile.groupId") {
          if (key == "$set") {
            var newGroupId = modifier[key][field];
            var group = Group.findOne(newGroupId);
            if (!hasInvitation(newGroupId) && group.creatorUserId != userId) {
              return true;
            }
          } else {
            return true; // don't modify groupId other than set
          }

          if (field == "profile") {
            return true; // no changing whole profile at once
          }
        }
      }
    }
  }
});

Meteor.publish("allUsers", function () {
  return Meteor.users.find();
});

Accounts.onCreateUser(function(options, user) {
  if (user.profile == null) {
    user.profile = {};
  }
  if (user.profile.name == null) {
    user.profile.name = user.emails[0].address;
  }
  return user;
});
