Session.setDefault('editing_task_item', null);

Template.home.events({
  'click .signup-button': function (event) {
    event.stopPropagation();
    $("#login-dropdown-list .dropdown-toggle").dropdown('toggle');
    $("#signup-link").click();
    $("#login-email").focus();
  }
});

Meteor.subscribe("allUsers");

Template._loginButtonsLoggedInDropdown.events({
  'click #login-buttons-edit-profile': function (event) {
    event.stopPropagation();
    Template._loginButtons.toggleDropdown();
    //Router.go('profileEdit');
  }
});

Accounts.ui.config({
  requestPermissions: {
    github: ['user:email']
  }
});
