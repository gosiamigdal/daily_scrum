Template.createGroup.events({
  'click input[type="button"]': function (e, tmpl) {
    var name = tmpl.$('input[type="text"]').val().trim();
    if (name.length > 0) {
      console.log("Creating group" + name);
      var id = Group.insert({name: name, creatorUserId: Meteor.userId()});
      Meteor.users.update(Meteor.userId(), {$set:
        {'profile.groupId': id}
      });
    } else {
      alert("Group needs a name.");
    }

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

Template.invitationItem.groupName = function () {
  var group = Group.findOne(this.groupId);
  return group.name;
}

Template.invitationItem.sender = function () {
  var user = Meteor.users.findOne(this.senderUserId);
  return user.emails[0].address;
}

Template.invitationItem.events({
  'click input[type="button"]': function () {
    Meteor.users.update(Meteor.userId(), {$set:
      {"profile.groupId": this.groupId}
    });
    Invitation.remove(this._id);
  }
});
