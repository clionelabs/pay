Meteor.publish('paymentRequests', function() {
  return PaymentRequests.find();
});

Meteor.publish('paymentRequest', function(paymentRequestId) {
  return [
    PaymentRequests.find(paymentRequestId),
    Payments.find({paymentRequestId: paymentRequestId})
  ]
});

Meteor.publish('payment', function(paymentId) {
  var payment = Payments.findOne(paymentId);
  return [
    Payments.find(paymentId),
    PaymentRequests.find(payment.paymentRequestId)
  ]
});

Meteor.publish('bills', function () {
  return Bills.find();
});

Meteor.publish('bill', function(billId) {
  return Bills.find({_id: billId});
});

Meteor.publish('billAuthorizations', function(billId) {
  return BillAuthorizations.find({billId: billId});
});

Meteor.publish('billAuthorization', function(_id) {
  return BillAuthorizations.find({_id: _id});
});
