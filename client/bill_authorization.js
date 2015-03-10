Template.bill_authorization.events({
  'click #authorize_button': function() {
    var billAuthorizationId = this._id;
    Meteor.call('authorizeBill', billAuthorizationId);
    Router.go("bill", {_id: this.billId});
  }
});
