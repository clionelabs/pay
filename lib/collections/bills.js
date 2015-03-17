Bill = function(doc) {
  _.extend(this, doc);
};

Bill.prototype.topUpAmount = function() {
  //TODO very important, test case needed
  return this.amount * 0.05;
};

Bill.prototype.totalAmount = function() {
  //TODO very important, test case needed
  return this.amount + this.topUpAmount();
};
