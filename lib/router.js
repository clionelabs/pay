Router.map(function() {
  this.route('bills', {
    path: '/',
    action: function() {
      this.render('bills');
    }
  });
});
