Meteor.startup(() => {
  SSR.compileTemplate("reviewing", Assets.getText('email_templates/reviewing.html'));

});

