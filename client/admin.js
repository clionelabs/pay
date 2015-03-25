Template.adminLogin.events({
  'submit #signinForm' : function(e, t){
    e.preventDefault();
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();
 
    Meteor.loginWithPassword(email, password, function(err) {
      if (err) {
        Notifications.error('Login failed', err);
      }
    });
    return false;
  }
});
