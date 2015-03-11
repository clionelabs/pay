Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'bills',
  data: function () {
    var context = {
      bills: Bills.find()
    }
    return context;
  },
  action: function () {
    this.render('bills');
  }
});

Router.route('bill/:_id', {
  name: 'bill',
  data: function() {
    return Bills.findOne(this.params._id);
  },
  action: function() {
    this.render('bill');
  }
});

Router.route('bills/create', {
  name: 'bill_create',
  action: function() {
    this.render('bill_create');
  }
});

Router.route('template_preview/reviewing', {
  name: 'template_preview_reviewing',
  action: function() {
    this.response.end(SSR.render('reviewing'));
  },
  where : 'server'
});

