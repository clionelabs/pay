Meteor.methods({
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

  authorizeBill: function(billAuthorizationId) {
    var billAuthorization = BillAuthorizations.findOne(billAuthorizationId);
    if (!billAuthorization) {
      throw 'Authorization not found';
    }
    var bill = Bills.findOne(billAuthorization.billId);

    bill.authorize();
  },

  processedBill: function(billId) {
    var bill = Bills.findOne(billId);
    if (!bill) {
      throw 'Bill not found';
    }
    bill.processed();
  }
});
