Email.from = "pay@askdouble.com";

Email.shouldSendRealEmail = function() {
  let onProduction = (process.env.NODE_ENV === 'production');
  let enableInNonProduction = Meteor.settings.email.enableInNonProduction;
  return (onProduction || enableInNonProduction);
};

Email.configureEmail = function() {
  if (this.shouldSendRealEmail()) {
    var smtpSettings = Meteor.settings.email.smtp;
    var username = encodeURIComponent(smtpSettings.username);
    var password = smtpSettings.password;
    var host = smtpSettings.host;
    var port = smtpSettings.port;
    process.env.MAIL_URL = 'smtp://' + username + ':' + password +
    '@' + host + ':' + port;
    console.info('[System] Email configured: ', process.env.MAIL_URL);
  } else {
    console.info('[System] Not in production mode. Sending all email to console.');
  }
};

Email.validateMailgun = function(api_key, token, timestamp, signature) {
  let crypto = Meteor.npmRequire('crypto');
  let hmac = crypto.createHmac('SHA256', api_key);

  return signature === hmac.update(timestamp + token).digest('hex');
};

Email.sendTemplate = function(templateName, to, bill) {
  let content = SSR.render(templateName);

  Email.send({
    "from": Email.from,
    "to": to,
    "subject": Meteor.copies.subjects[templateName],
    "html": content
  });
}

Meteor.startup(() => {

  //expected to be the same name as the Meteor.copies.subject in copy.es6.js
  SSR.compileTemplate("review", Assets.getText('email_templates/review.html'));
  SSR.compileTemplate("authorization", Assets.getText('email_templates/authorization.html'));
  SSR.compileTemplate("paid", Assets.getText('email_templates/paid.html'));
  SSR.compileTemplate("rejected", Assets.getText('email_templates/rejected.html'));

  Email.configureEmail();
});

PaymentRequests.find({ "events.type" : PaymentRequest.Events.SENT_AUTH}).observe({
  "added" : function(payReq) {
    Email.sendTemplate("authorization", payReq.bill.email, payReq.bill);
  }
});
PaymentRequests.find({ "events.type" : PaymentRequest.Events.PROCESSED}).observe({
  "added" : function(payReq) {
    Email.sendTemplate("paid", payReq.bill.email, payReq.bill);
  }
});
