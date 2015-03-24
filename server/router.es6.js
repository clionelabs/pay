Router.route('webhooks/bill_received', {
  name: 'webhooks_bill_received',
  action() {
    let formidable = Meteor.npmRequire('formidable');
    let util = Meteor.npmRequire('util');

    let postInfo = new formidable.IncomingForm();
    let request = this.request;
    let response = this.response;

    if (this.request.method !== 'POST') {
      this.response.writeHead(403, {});
      this.response.end();
      //TODO add log
      return;
    }

    let wrappedPostInfo = Async.wrap(postInfo, ['parse']);
      wrappedPostInfo.parse(request, Meteor.bindEnvironment((err, fields, files) => {

        let apiKey = Meteor.settings.email.mailgun.apiKey;
        let token = fields.token;
        let ts = fields.timestamp;
        let signature = fields.signature;

        /*
        if (!Email.validateMailgun(apiKey, token, ts, signature)) {
          response.writeHead(406, {});
          response.end();
          //TODO add log
          return;
        }
        */
        PaymentRequests.createWithRaw(fields);
        //console.log(util.inspect({ "fields" : fields , "files" : files}));
        response.writeHead(200, {'content-type': 'text/plain'});
        response.end('');
      }));

  },
  where : 'server'
});

Router.route('/', {
  name : 'marketing',
  action() {
    let contents = Assets.getText('static/index.html');
    this.response.end(contents);
  },
  where : 'server'
});
