Meteor.methods({
  create_bill: function(doc) {
    var bill = _.extend({}, doc, {status: Bill.Status.REVIEWED});
    var billId = Bills.insert(bill);
    return {
      billId: billId
    }
  }
});
