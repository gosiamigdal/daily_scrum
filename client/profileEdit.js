Template.profileEdit.username = function () {
  if (Meteor.user() != null) {
    return Meteor.user().profile.name;
  } else {
    return "";
  }
}

Template.profileEdit.events({
  'click input[type="button"]': function (e, tmpl) {
    var name = tmpl.$('input[type="text"]').val();
    Meteor.users.update(Meteor.userId(), {$set:
      {"profile.name": name}
    });
  }
});



 