Template.createGroup.events({
  'click input[type="button"]': function (e, tmpl) {
    var name = tmpl.$('input[type="text"]').val();
    console.log("Creating group" + name);
    var id = Group.insert({name: name, creatorUserId: Meteor.userId()});
    Meteor.users.update(Meteor.userId(), {$set:
      {'profile.groupId': id}
    });

  }

});

Template.joinGroup.hasInvitation = function () {
  if (Meteor.user() == null) {
    return false;
  }
  var email = Meteor.user().emails[0].address;
  if (Invitation.find({email: email}).count() != 0) {
    return true;
  }
}

Template.joinGroup.invitations = function () {
  // TODO: more emails?
  var email = Meteor.user().emails[0].address;
  return Invitation.find({email: email}).fetch();
}
