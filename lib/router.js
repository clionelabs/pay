var subs = new SubsManager();

Router.configure({
  layoutTemplate: 'layout'
});

Router.route('admin', {
  name: 'admin',
  onBeforeAction: function() {
    if (Meteor.user()) {
      Router.go("paymentRequests");
    }
    this.next();
  },
  action: function() {
    this.render('adminLogin');
  }
});

Router.route('/admin/paymentRequests', {
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
  onBeforeAction: function() {
    if (!Meteor.user()) {
      Router.go('admin');
    }
    this.next();
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequests');
    }
  }
});

Router.route('admin/paymentRequests/create', {
  name: 'createPaymentRequest',
  onBeforeAction: function() {
    if (!Meteor.user()) {
      Router.go('admin');
    }
    this.next();
  },
  action: function() {
    this.render('createPaymentRequest');
  }
});

Router.route('admin/paymentRequest/:_id', {
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
  onBeforeAction: function() {
    if (!Meteor.user()) {
      Router.go('admin');
    }
    this.next();
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequest');
    }
  }
});

Router.route('admin/paymentRequest/:_id/edit', {
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
  onBeforeAction: function() {
    if (!Meteor.user()) {
      Router.go('admin');
    }
    this.next();
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
