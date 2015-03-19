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
});

Router.route('paymentRequestAuthorization/:_id', {
  name: 'paymentRequestAuthorization',
  waitOn: function() {
    return Meteor.subscribe("paymentRequest", this.params._id);
  },
  data: function() {
    return PaymentRequests.findOne(this.params._id);
  },
  onRun: function() {
    Session.set('authorizationInfo', null);
    Meteor.call('getPaymentRequestAuthorizationInfo', this.params._id, function(error, result){
      Session.set('authorizationInfo', result);
      console.log("onRUn callback authorizationInfo: ", Session.get('authorizationInfo'));
    });
    this.next();
  },
  action: function() {
    var paymentRequest = PaymentRequests.findOne(this.params._id);
    var authorizationInfo = Session.get('authorizationInfo');
    if (this.ready() && authorizationInfo) {
      if (paymentRequest.isAuthorized()) {
        this.render('paymentRequestAlreadyAuthorized');
      } else if (authorizationInfo.isReturning) {
        this.render('paymentRequestReturnAuthorization');
      } else {
        this.render('paymentRequestNewAuthorization');
      }
    }
  }
});

Router.route('paymentRequestAuthorizationSuccess/:_id', {
  name: 'paymentRequestAuthorizationSuccess',
  waitOn: function() {
    return Meteor.subscribe("paymentRequest", this.params._id);
  },
  data: function() {
    return PaymentRequests.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequestAuthorizationSuccess');
    }
  }
});

Router.route('paymentRequestAuthorizationFail/:_id', {
  name: 'paymentRequestAuthorizationFail',
  waitOn: function() {
    return Meteor.subscribe("paymentRequest", this.params._id);
  },
  data: function() {
    return PaymentRequests.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      this.render('paymentRequestAuthorizationFail');
    }
  }
});
