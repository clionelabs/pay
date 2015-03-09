Template.bills.events({
  'click button.create': function() {
    Router.go("bill_create");
  },

  'click tr.bill_row': function() {
    var billId = this._id;
    Router.go("bill", {_id: billId});
  }
});
