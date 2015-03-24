/**
 * @property {Object} bill
 * @property {String} customerId
 * @property {String} state
 * @property {Object[]} logs
 * @property {Date} createdAt
 */
PaymentRequests = new Meteor.Collection('payment_requests', {
  transform: function(doc) {
    return new PaymentRequest(doc);
  }
});

PaymentRequests.create = function(customer, bill, raw) {
  var doc = {
    customerId: customer._id,
    bill: bill,
    raw: raw,
    createdAt: moment().valueOf(),
    state: 'created'
  };
  var insertedId = PaymentRequests.insert(doc);
  var paymentRequest = PaymentRequests.findOne(insertedId);
  paymentRequest.initialize(); //created-->reviewing and trigger onafterinitialize email
  return insertedId; 
}

/**
 * Form schema: Schemas.PaymentRequestForm
 */
PaymentRequests.createWithForm = function(data) {
  var customer = Customers.createIfNotExisted(data.customerEmail, data.customerFirstName, data.customerLastName);
  var paymentRequestId = PaymentRequests.create(customer, data.bill, {});
  return paymentRequestId;
}

PaymentRequests.createWithRaw = function(raw) {
  var customer = Customers.createIfNotExisted(raw.sender, '[MISSING_FIRST_NAME]', '[MISSING_LAST_NAME]');
  var paymentRequestId = PaymentRequests.create(customer, {}, raw); 
  return paymentRequestId;
}

/**
 * Form schema: Schemas.EditPaymentRequestForm
 */
PaymentRequests.editWithForm = function(data) {
  Customers.update({email: data.customerEmail}, {$set: {firstName: data.customerFirstName, lastName: data.customerLastName}}); 
  PaymentRequests.update({_id: data.paymentRequestId}, {$set: {bill: data.bill}});
}

/**
 * States: created, reviewing, authorizing, processing, rejected, resolved
 *
 */
PaymentRequest = function(doc) {

  _.extend(this, doc);
  if (Meteor.isServer) {
    var stateMachine = StateMachine.create({
      initial: doc.state,
      error: function(eventName, from, to, args, errorCode, errorMessage, stack) {
        console.log('[PaymentRequests] error: ', eventName, from, to, args, errorCode, errorMessage);
        console.log(stack);
      },
      events: [
        {name: PaymentRequest.EVENTS.INITIALIZE, from: 'created',     to: 'reviewing'},
        {name: PaymentRequest.EVENTS.REJECT,     from: 'reviewing',   to: 'rejected'},
        {name: PaymentRequest.EVENTS.ACCEPT,     from: 'reviewing',   to: 'authorizing'},
        {name: PaymentRequest.EVENTS.AUTHORIZE,  from: 'authorizing', to: 'processing'},
        {name: PaymentRequest.EVENTS.COMPLETE,   from: 'processing',  to: 'resolved'}
      ],
      callbacks: {
        onafterinitialize: function (event, from, to) {
          Email.Review.send(this.bill.email);
        },
        onafterreject: function (event, from, to) {
          Email.Rejection.send(this.bill.email);
        },
        onafteraccept: function (event, from, to) {
          var paymentRequest = this;
          paymentRequest.generateAuthorizationPasscode();
          Email.Authorization.send(paymentRequest.bill.email, paymentRequest);
        },
        onaftercomplete: function (event, from, to) {
          Email.Paid.send(this.bill.email);
        },
        onenterstate: function (event, from, to) {
          var paymentRequest = this;
          var log = {type: 'enterState', state: to, timestamp: moment().valueOf()};
          PaymentRequests.update({_id: paymentRequest._id}, {$set: {state: to}, $push: {logs: log}});
        }
      }
    });
    _.extend(this, stateMachine);
  }
};
PaymentRequest.EVENTS = {
  'INITIALIZE' : 'initialize',
  'REJECT': 'reject',
  'ACCEPT': 'accept',
  'AUTHORIZE': 'authorize',
  'COMPLETE': 'complete'
};

PaymentRequest.BillNotFoundException = "Bill is not found";

PaymentRequest.prototype.isAuthorized = function() {
  return this.state === 'resolved' || this.state === 'processing';
}

PaymentRequest.prototype.getCustomer = function() {
  return Customers.findOne(this.customerId);
};

PaymentRequest.prototype.serviceFee = function() {
  return this.bill.amount * 0.05;
};

PaymentRequest.prototype.totalAmount = function() {
  return this.serviceFee() + this.bill.amount;
};

PaymentRequest.prototype.title = function() {
  return this.bill ? this.bill.title : "";
};

PaymentRequest.prototype.company = function() {
  return this.bill ? this.bill.company: "";
};

PaymentRequest.prototype.deadline = function() {
  return this.bill ? this.bill.deadline: "";
};

PaymentRequest.prototype.formatAmount = function() {
  if (!this.bill) { throw PaymentRequest.BillNotFoundException };
  return this.bill.currency + " " + this.bill.amount;
};

PaymentRequest.prototype.formatServiceFee = function() {
  if (!this.bill) { throw PaymentRequest.BillNotFoundException };
  return this.bill.currency + " " + this.serviceFee();
};

PaymentRequest.prototype.formatTotalAmount = function() {
  if (!this.bill) { throw PaymentRequest.BillNotFoundException };
  return this.bill.currency + " " + this.totalAmount();
};

PaymentRequest.prototype.deadline = function() {
  if (!this.bill) { throw PaymentRequest.BillNotFoundException };
  return this.bill.deadline;
}

PaymentRequest.prototype.generateAuthorizationPasscode = function() {
  var code = (""+Math.random()).substring(2,7);
  PaymentRequests.upsert({_id: this._id}, {$set: {passcode: code}});
  this.passcode = code;
}
