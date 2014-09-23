SyncedCron.add({
  name: 'Sent email reminders to update their daily status',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.cron('0 17 * *');
  },
  job: function() {
    console.log('Sending email reminders');
    var sendCount = 0;
    var skipCount = 0;
    Meteor.users.find().forEach(function(user) {
      var profile = _.defaults(user.profile, {sendDailyEmails: true});
      if (profile.sendDailyEmails) {
        // Send email
        Email.send({
          to: user.emails[0].address,
          from: "daily.scrum@example.com",
          subject: user.profile.name + " fill what you have done today!",
          text: "Please fill what you done today " + Meteor.absoluteUrl() + "\n" +
            "\n" +
            "Delivered to you by daily scrum"
        });
        sendCount += 1;
      } else {
        // Skipping
        skipCount += 1;
      }
    });
    console.log('Sent %d email, skipped %d users', sendCount, skipCount);
    return 'Emails sent';
  }
});

Meteor.startup(function () {
  // code to run on server at startup
  SyncedCron.start();
});

Task.allow({
  insert: function (userId, doc) {
    return userId != null &&
      doc.userId == userId &&
      Meteor.users.findOne(userId).profile.groupId == doc.groupId;
  },
  update: function (userId, doc, fieldNames, modifier) {
    return doc.userId == userId &&
      fieldNames.indexOf('groupId') == -1 &&
      fieldNames.indexOf('userId') == -1;
  },
  remove: function (userId, doc) {
    return doc.userId == null || doc.userId == userId;
  }
});

Group.allow({
  insert: function (userId, doc) {
    return userId != null &&
      doc.creatorUserId == userId &&
      Meteor.users.findOne(userId).profile.groupId == null;
  }
});

Invitation.allow({
  insert: function (userId, doc) {
    var user = Meteor.users.findOne(userId);
    var canInsert = userId != null &&
      doc.senderUserId == userId &&
      user.profile.groupId == doc.groupId;

    if (canInsert) {
      Email.send({
        to: doc.email,
        from: "daily.scrum@example.com",
        subject: user.profile.name + " invited you to daily scrum!",
        text: "Please sign up at " + Meteor.absoluteUrl() + "\n" +
          "\n" +
          "Delivered to you by daily scrum"
      });
    }

    return canInsert;
  },
  remove: function (userId, doc) {
    var user = Meteor.users.findOne(userId);
    return user.profile.groupId == doc.groupId;
  }
});

Meteor.users.deny({
  update: function (userId, doc, fieldNames, modifier) {
    console.log("Meteor.users update(%s, %s, %s, %s)",
      userId, doc, fieldNames, modifier);
    function hasInvitation(newGroupId) {
      var email = Meteor.users.findOne(userId).emails[0].address;
      var foundInvitation = false;
      Invitation.find({email: email}).forEach(function (invite) {
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
        if (field == 'profile.groupId') {
          if (key == '$set') {
            var newGroupId = modifier[key][field];
            var group = Group.findOne(newGroupId);
            if (!hasInvitation(newGroupId) && group.creatorUserId != userId) {
              return true;
            }
          } else {
            return true; // don't modify groupId other than set
          }

          if (field == 'profile') {
            return true; // no changing whole profile at once
          }
        }
      }
    }
  }
});



Accounts.onCreateUser(function (options, user) {
  if (user.profile == null) {
    user.profile = {};
  }

  if (user.services != null && user.services.github != null) {
    // User signed up with Github
    user.emails = [{
      address: user.services.github.email,
      verified: true
    }];

    try {
      var result = HTTP.get("https://api.github.com/user",
        {params: {access_token: user.services.github.accessToken},
        headers: {"User-Agent": "DailyScrumApp"}});

      if (result.statusCode == 200) {
        user.profile.avatarUrl = result.data.avatar_url + '&size=50';
      } else {
        console.log("ERROR: Can't fetch avatar from github. Wrong status code.");
        console.log(result);
      }
    } catch (e) {
      // No-op: we don't care if we can't get user avatar.
      console.log("ERROR: Can't fetch avatar from github");
      console.log(e);
    }
  }

  if (user.profile.name == null) {
    user.profile.name = user.emails[0].address;
  }

  if (user.profile.avatarUrl == null) {
    var randomNum = Math.floor(Math.random() * 16) + 1;
    var randomStr;
    if (randomNum < 10) {
      randomStr = "0" + randomNum;
    } else {
      randomStr = "" + randomNum;
    }
    user.profile.avatarUrl = "/images/avatar_" + randomStr + ".png";
  }

  return user;
});
