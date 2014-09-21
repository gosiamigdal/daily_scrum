Template.profileEdit.username = function () {
  if (Meteor.user() != null) {
    return Meteor.user().profile.name;
  } else {
    return "";
  }
}

Template.profileEdit.sendDailyEmails = function () {
  if (Meteor.user() != null) {
    var user = _.defaults(Meteor.user().profile, {sendDailyEmails: true});
    return user.sendDailyEmails;
  } else {
    return false;
  }
}

Template.profileEdit.events({
  'click input[type="button"]': function (e, tmpl) {
    var name = tmpl.$('input[type="text"]').val();
    var sendEmails = tmpl.$('input[type="checkbox"]').prop('checked');
    Meteor.users.update(Meteor.userId(), {$set:
      {'profile.name': name,
      'profile.sendDailyEmails': sendEmails}
    });
  }
});
