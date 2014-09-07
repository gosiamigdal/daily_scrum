Router.map(function() {
  this.route('home', {
    path: '/'
  });
  this.route('setup');
  this.route('done', {
    data: function () {
      var m = moment();
      Session.set('current_date', m.valueOf());
    }
  });
  this.route('doneOn', {
    template: 'done',
    path: '/done/on/:_date',
    data: function () {
      var m = moment(this.params._date, 'YYYY-MM-DD');
      Session.set('current_date', m.valueOf());
    }
  });
  this.route('about');
  this.route('profileEdit');
});
