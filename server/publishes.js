Meteor.publish('paymentRequests', function() {
  if (!this.userId) {
    this.ready();
    return;
  }

  return [
    PaymentRequests.find(),
    Customers.find()
  ]
});

Meteor.publish('paymentRequest', function(paymentRequestId) {
  if (!this.userId) {
    this.ready();
    return;
  }

  var paymentRequest = PaymentRequests.findOne(paymentRequestId, {transform: null});
  return [
    PaymentRequests.find(paymentRequestId),
    Customers.find(paymentRequest.customerId)
  ]
});
