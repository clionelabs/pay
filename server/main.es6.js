Meteor.startup(()=> {
  Accounts.config({
    forbidClientAccountCreation: true
  });

  if (Meteor.settings.adminAccount) {
    var email = Meteor.settings.adminAccount.email;
    var password = Meteor.settings.adminAccount.password;

    if (!Meteor.users.findOne({emails: {$elemMatch: {address: email}}})) {
      Accounts.createUser({email: email, password: password});
    }
  }
});
