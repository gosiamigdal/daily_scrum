Template.home.events({
  'click .signup-button': function (event) {
    event.stopPropagation();
    $("#login-dropdown-list .dropdown-toggle").dropdown('toggle');
    $("#signup-link").click();
    $("#login-email").focus();
  }
});
