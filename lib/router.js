Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() {
  this.route('bills', {
    path: '/',
    data: function() {
      var context = {
        bills: Bills.find()
      }
      return context;
    },
    action: function() {
      this.render('bills');
    }
  });

  this.route('bill', {
    path: 'bill/:_id',
    data: function() {
      return Bills.findOne(this.params._id);
    },
    action: function() {
      this.render('bill');
    }
  });

  this.route('bill_create', {
    path: 'bills/create',
    action: function() {
      this.render('bill_create');
    }
  });
});
