Customers = new Meteor.Collection('customers', {
  transform: function(doc) {
    return new Customer(doc);
  }
});

Customers.createIfNotExist = function(email) {
  var customer = Customers.findOne({email: email});
  if (!!customer) {
    return customer._id;
  }
  var customerId = Customers.insert({email: email});
  return customerId;
}

Customer = function(doc) {
  _.extend(this, doc);
}
