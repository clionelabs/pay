var subs = new SubsManager();

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
});;
Router.route('paymentRequestAuthorization/new/:_id', {
  name: 'paymentRequestAuthorizationNew',
  waitOn: function() {
    return Meteor.subscribe("paymentRequest", this.params._id);
  },
  data: function() {
    return PaymentRequests.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequestNewAuthorize');
    }
  }
});

Router.route('paymentRequestAuthorization/return/:_id', {
  name: 'paymentRequestAuthorizationReturn',
  waitOn: function() {
    return Meteor.subscribe("paymentRequest", this.params._id);
  },
  data: function() {
    return PaymentRequests.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequestReturnAuthorize');
    }
  }
});
