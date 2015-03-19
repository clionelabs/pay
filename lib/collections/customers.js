/**
 * @property email
 * @property firstName
 * @property lastName
 *
 * TODO: log all request/response
 */
Customers = new Meteor.Collection('customers', {
  transform: function(doc) {
    return new Customer(doc);
  }
});

Customers.createAuthorizationToken = function() {
  var response = BraintreeHelper.getInstance().clientTokenGenerate({});
  return response.clientToken;
};

Customers.createNew = function(email, firstName, lastName) {
  return Customers.insert({email: email, firstName: firstName, lastName: lastName});
};

Customer = function(doc) {
  _.extend(this, doc);
};

Customer.prototype.createVault = function(nonce) {
  var options = {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    paymentMethodNonce: nonce
  };

  var gateway = BraintreeHelper.getInstance().getGateway();
  var wrappedCall = Meteor.wrapAsync(gateway.customer.create, gateway.customer);
  var response = wrappedCall(options);
  console.log("[Customer] createVault request: ", options, JSON.stringify(response));
  return response.success;
};

Customer.prototype.isPaymentMethodAvailable = function() {
  return this.getPaymentMethod() !== null;
}

Customer.prototype.getPaymentMethod = function() {
  var vault = this.getVault();
  if (vault === null) return null;
  if (vault.paymentMethods.length === 0) return null; // not supposed to happen
  return vault.paymentMethods[0]; // Currently, we only allow one payment method, so that one would be the default
}

Customer.prototype.getVault = function() {
  var gateway = BraintreeHelper.getInstance().getGateway();
  try {
    var wrappedCall = Meteor.wrapAsync(gateway.customer.find, gateway.customer);
    var customer = wrappedCall(this._id); // API call return a braintree customer object
    console.log("[Customer] getVault customer: ", customer);
    return customer;
  } catch (err) {
    console.log("[Customer] getVault err: ", err.message);
    return null;
  }
}

Customer.prototype.charge = function(paymentRequest) {
  var amount = paymentRequest.bill.amount;

  var options = {
    customerId: this._id,
    amount: amount,
    options: {
      submitForSettlement: true
    }
  }

  var gateway = BraintreeHelper.getInstance().getGateway();
  var wrappedCall = Meteor.wrapAsync(gateway.transaction.sale, gateway.transaction);
  var response = wrappedCall(options);
  console.log("[Customer] sale request: ", options, JSON.stringify(response));
  return response.success;
};

Meteor.startup(function customerStartup() {
  PaymentRequests.find({ 'customerId' : { $exists : false }}).observe({
    'added' : function(payReq) {
      var bill = payReq.bill;
      var customerId = Customers.createNew(bill.email, bill.recipientFirstName, bill.recipientLastName);
      PaymentRequests.update({ _id : payReq._id }, { $set : { 'customerId' : customerId }});
    }
  });
});
