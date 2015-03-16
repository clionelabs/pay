Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
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

Router.route('paymentAuthorization/:paymentId', {
  name: 'paymentAuthorization',
  waitOn: function() {
    return Meteor.subscribe('payment', this.params.paymentId);
  },
  data: function() {
    return Payments.findOne(this.params.paymentId);
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentAuthorization');
    }
  }
});
