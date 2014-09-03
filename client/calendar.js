Template.calendar.month = function () {
  return moment().format('MMMM');
}

Template.calendar.weekDays = function () {
  var result = [];
  for (var i = 0; i < 7; i++) {
    var day = moment().day(i).format('ddd');
    result.push({day: day});
  }
  return result;
}

Template.calendar.weeksOfMonth = function () {
  var result = [];
  var m = moment();
  var currentMonth = m.month();
  m.date(1);
  m.day(0);
  do {
    var daysOfWeek = [];
    for (var i = 0; i < 7; i++) {
      if (m.month() == currentMonth) {
        daysOfWeek.push({date: m.date()});
      } else {
        daysOfWeek.push({date: ""});
      }
      m.add(1, 'days');
    }
    result.push({daysOfWeek: daysOfWeek});
  } while (m.month() == currentMonth)
  return result;
}

Template.calendarDay.selected = function () {
  var m = moment().date(this.date)
  var selectedDate = moment(Session.get('current_date'));
  return m.date() == selectedDate.date();
}

Template.calendarDay.events({
  'click td': function () {
    if (this.date != "") {
      var m = moment().date(this.date)
      Session.set('current_date', m.valueOf());
    }
  }
})
