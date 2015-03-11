Router.route('template_previews/reviewing', {
  name: 'template_preview_reviewing',
  action() {
    this.response.end(SSR.render('reviewing'));
  },
  where : 'server'
});

Router.route('webhooks/init', {
  name: 'webhooks_init',
  action() {
    let formidable = Meteor.npmRequire('formidable');
    let util = Meteor.npmRequire('util');

    let postInfo = new formidable.IncomingForm();
    let request = this.request;
    let response = this.response;
    Async.runSync(() => {
      postInfo.parse(request, (err, fields, files) => {

        let check = (api_key, token, timestamp, signature) => {
          let crypto = Meteor.npmRequire('crypto');
          let hmac = crypto.createHmac('SHA256', api_key);

          return signature === hmac.update(timestamp + token).digest('hex');
        };

        if (!check("key-b4559e5d4df905e6711f1deb3cd4c0f2", fields.token, fields.timestamp, fields.signature)) {
          response.writeHead(406, {});
          response.end();
          //TODO add log
          return;
        }

        response.writeHead(200, {'content-type': 'text/plain'});
        response.end('');
      });
    });

    let generateEmailHeader = (request) => {

    };


    if (this.request.method !== 'POST') {
      this.response.writeHead(403, {});
      this.response.end();
      //TODO add log
      return;
    }

    //Email.send();
    this.response.writeHead(200, {'Content-Type' : 'text/html'})
    this.response.end();
  },
  where : 'server'
});
