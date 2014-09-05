Session.setDefault('current_date', moment().valueOf());

var selectedMoment = function () {
  return moment(Session.get('current_date'));
}

Template.calendar.month = function () {
  return selectedMoment().format('MMMM');
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
  var today = moment();
  var m = selectedMoment();
  var selectedMonth = m.month();
  var selectedDay = m.date();
  m.date(1);
  m.day(0);
  do {
    var daysOfWeek = [];
    for (var i = 0; i < 7; i++) {
      if (m.month() == selectedMonth) {
        var clazz = "day";
        if (m.isAfter(today)) {
          clazz += " future";
        }
        if (m.date() == selectedDay) {
          clazz += " selected";
        }
        daysOfWeek.push({date: m.date(), attr: {class: clazz}});
      } else {
        daysOfWeek.push({date: ""});
      }
      m.add(1, 'days');
    }
    result.push({daysOfWeek: daysOfWeek});
  } while (m.month() == selectedMonth)
  return result;
}

Template.calendar.events({
  'click .previous-month': function () {
    var m = selectedMoment();
    m.date(1);
    m.subtract(1, 'month');
    Session.set('current_date', m.valueOf());
  },
  'click .next-month': function () {
    var m = selectedMoment();
    m.date(1);
    m.add(1, 'month');
    Session.set('current_date', m.valueOf());
  }
});

Template.calendarDay.events({
  'click td': function () {
    if (this.date != "") {
      var m = selectedMoment().date(this.date)
      Session.set('current_date', m.valueOf());
    }
  }
})
