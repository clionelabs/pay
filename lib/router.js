var subs = new SubsManager();

Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/paymentRequests', {
  name: 'paymentRequests',
  waitOn: function() {
    return Meteor.subscribe('paymentRequests');
  },
  data: function() {
    var context = {
      paymentRequests: PaymentRequests.find({}, {sort: {createdAt: -1}})
    }
    return context;
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequests');
    }
  }
});

Router.route('paymentRequests/create', {
  name: 'createPaymentRequest',
  action: function() {
    this.render('createPaymentRequest');
  }
});

Router.route('paymentRequest/:_id', {
  name: 'paymentRequest',
  waitOn: function() {
    var paymentRequestId = this.params._id;
    return [
      Meteor.subscribe("paymentRequest", paymentRequestId)
    ]
  },
  data: function() {
    return PaymentRequests.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequest');
    }
  }
});

Router.route('paymentRequest/:_id/edit', {
  name: 'editPaymentRequest',
  waitOn: function() {
    var paymentRequestId = this.params._id;
    return [
      Meteor.subscribe("paymentRequest", paymentRequestId)
    ]
  },
  data: function() {
    return PaymentRequests.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      this.render('editPaymentRequest');
    }
  }
});

Router.route('paymentRequestAuthorization/:_id', {
  name: 'paymentRequestAuthorization',
  data: function() {
    return Session.get('authorizationInfo');
  },
  onRun: function() {
    Session.set('authorizationInfo', null);
    Meteor.call('getPaymentRequestAuthorizationInfo', this.params._id, function(error, result){
      Session.set('authorizationInfo', result);
    });
    this.next();
  },
  action: function() {
    var authorizationInfo = Session.get('authorizationInfo');
    if (authorizationInfo) {
      this.render('paymentRequestAuthorization');
    }
  }
});
