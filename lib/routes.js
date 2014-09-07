Router.map(function() {
  this.route('home', {
    path: '/'
  });
  this.route('setup');
  this.route('done');
  this.route('doneOn', {
    path: '/done/on/:_date',
    data: function () {
      console.log(this.params);
      console.log(this.params[0]);
    }
  });
});
