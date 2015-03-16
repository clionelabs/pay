Meteor.methods({
  createPaymentRequest: function(data) {
    var paymentRequestId = PaymentRequests.createWithBill(data);
    return paymentRequestId;
  },

  sendPaymentAuthorization: function(paymentRequestId) {
    var paymentRequest = PaymentRequests.findOne(paymentRequestId);
    paymentRequest.sendPaymentAuthorization();
  },

  createBill: function(doc) {
    var bill = _.extend({}, doc, {
      status: Bill.Status.REVIEWED,
      createdAt: new Date()
    });
    var billId = Bills.insert(bill);
    return {
      billId: billId
    }
  },

  sendBillAuthorization: function(billId) {
    var bill = Bills.findOne(billId);
    if (!bill) {
      throw 'Bill not found';
    }
    var billAuthorizationId = bill.sendAuthorization();

    return {
      billAuthorizationId: billAuthorizationId
    }
  },

  processedBill: function(billId) {
    var bill = Bills.findOne(billId);
    if (!bill) {
      throw 'Bill not found';
    }
    bill.processed();
  },

  getAuthorizeBillToken: function() {
    var response = BraintreeHelper.getInstance().clientTokenGenerate({});
    return response.clientToken;
  },

  createAuthorizeBillTransaction: function(data) {
    var paymentId = data.paymentId;
    var nonce = data.nonce;
    var result = Payments.sale(paymentId, nonce);
    if (result) {
      
    }

    console.log("[methods] createAuthorizedBillTransaction: ", data);
    var billAuthorizationId = data.billAuthorizationId;
    var nonce = data.nonce;
    var firstName = data.firstName;
    var lastName = data.lastName;

    var billAuthorization = BillAuthorizations.findOne(billAuthorizationId);
    var bill = billAuthorization.getBill();

    var options = {
      orderId: bill._id,
      amount: bill.amount,
      paymentMethodNonce: nonce,
      customer: {
        firstName: firstName,
        lastName: lastName,
        email: bill.email
      },
      options: {
        submitForSettlement: true
      }
    }
    var response = BraintreeHelper.getInstance().transactionSale(options);

    //TODO: add log
    console.log("[methods] transaction options: ", options, ", response: ", response);
    if (response.success) {
      bill.authorize();
      return true;
    }
    return false;
  }
});

Meteor.startup(function() {
  var config = {
    environment: Braintree.Environment.Sandbox,
    publicKey: Meteor.settings.braintree.publicKey,
    privateKey: Meteor.settings.braintree.privateKey,
    merchantId: Meteor.settings.braintree.merchantId
  };
  console.log(BraintreeHelper.getInstance());
  BraintreeHelper.getInstance().connect(config);
});
