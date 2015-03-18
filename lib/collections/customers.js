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
}

Customers.createIfNotExisted = function(email, firstName, lastName) {
  var customer = Customers.findOne({email: email});
  if (customer) {
    return customer;
  }

  var customerId = Customers.insert({email: email, firstName: firstName, lastName: lastName});
  return Customers.findOne(customerId);
}

Customer = function(doc) {
  _.extend(this, doc);
}

Customer.prototype.createVault = function(nonce) {
  var options = {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    paymentMethodNonce: nonce
  }

  var gateway = BraintreeHelper.getInstance().getGateway();
  var wrappedCall = Meteor.wrapAsync(gateway.customer.create, gateway.customer);
  var response = wrappedCall(options);
  console.log("[Customer] createVault request: ", options, JSON.stringify(response));
  return response.success;
}

Customer.prototype.isInVault = function() {
  var gateway = BraintreeHelper.getInstance().getGateway();
  var wrappedCall = Meteor.wrapAsync(gateway.customer.find, gateway.customer);
  var response = wrappedCall(this._id);
  console.log("isInValue: ", response);
}

Customer.prototype.charge = function(paymentRequest) {
  var amount = paymentRequest.bill.amount;

  var options = {
    customerId: this._id,
    amount: amount
  }

  var gateway = BraintreeHelper.getInstance().getGateway();
  var wrappedCall = Meteor.wrapAsync(gateway.transaction.sale, gateway.transaction);
  var response = wrappedCall(options);
  console.log("[Customer] sale request: ", options, JSON.stringify(response));
  return response.success;
}
