Meteor.startup(() => {
  SSR.compileTemplate("reviewing", Assets.getText('email_templates/reviewing.html'));

});

Email.validateMailgun = (api_key, token, timestamp, signature) => {
    let crypto = Meteor.npmRequire('crypto');
    let hmac = crypto.createHmac('SHA256', api_key);

    return signature === hmac.update(timestamp + token).digest('hex');
};
