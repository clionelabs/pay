Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() {
  this.route('bills', {
    path: '/',
    waitOn: function() {
      return Meteor.subscribe("bills");
    },
    data: function() {
      var context = {
        bills: Bills.find({}, {sort: {createdAt: -1}})
      }
      return context;
    },
    action: function() {
      if (this.ready()) {
        this.render('bills');
      }
    }
  });

  this.route('bill', {
    path: 'bill/:_id',
    waitOn: function() {
      var billId = this.params._id;
      return [
        Meteor.subscribe("bill", billId),
        Meteor.subscribe("billAuthorizations", billId)
      ]
    },
    data: function() {
      var billId = this.params._id;
      var context = {
        bill: Bills.findOne(billId),
        authorizations: BillAuthorizations.find({billId: billId})
      }
      return context;
    },
    action: function() {
      if (this.ready()) {
        this.render('bill');
      }
    }
  });

  this.route('bill_create', {
    path: 'bills/create',
    action: function() {
      this.render('bill_create');
    }
  });

  this.route('bill_authorization', {
    path: 'billAuthorization/:_id',
    waitOn: function() {
      return Meteor.subscribe("billAuthorization", this.params._id);
    },
    data: function() {
      return BillAuthorizations.findOne(this.params._id);
    },
    action: function() {
      if (this.ready()) {
        this.render('bill_authorization');
      }
    }
  });
});
