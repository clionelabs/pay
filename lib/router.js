Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'bills',
  waitOn: function() {
    return Meteor.subscribe("bills");
  },
  data: function () {
    var context = {
      bills: Bills.find({}, {sort: {createdAt: -1}})
    }
    return context;
  },
  action: function () {
    if (this.ready()) {
      this.render('bills');
    }
  }
});

Router.route('bill/:_id', {
  name: 'bill',
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

Router.route('bills/create', {
  name: 'bill_create',
  action: function() {
    this.render('bill_create');
  }
});

Router.route('billAuthorization/:_id', {
  name: 'bill_authorization',
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

Router.route('template_preview/reviewing', {
  name: 'template_preview_reviewing',
  action: function() {
    this.response.end(SSR.render('reviewing'));
  },
  where : 'server'
});
