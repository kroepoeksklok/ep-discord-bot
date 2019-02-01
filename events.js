const moment = require('moment/moment.js');

class Events {
  constructor() {
    this.monday = 1;
    this.tuesday = 2;
    this.wednesday = 3;
    this.thursday = 4;
    this.friday = 5;
    this.saturday = 6;
    this.sunday = 7;

    this.weekendWarStartEnd = 20;
    this.weekWarStartEnd = 11;

    this.warGoingOn = false;
  }

  getNextWeekWednesdayWar(referenceDate) {
    const nextWednesday = moment.utc(referenceDate).add(1, 'w').isoWeekday(this.wednesday);
    this.setTime(nextWednesday, this.weekWarStartEnd);
    return nextWednesday;
  }

  getNextWarInSameWeek(referenceDate, isoDay, startingHour) {
    const nextWarDay = moment.utc(referenceDate).isoWeekday(isoDay);
    this.setTime(nextWarDay, startingHour);
    return nextWarDay;
  }

  setTime(momentDate, startingHour) {
    momentDate.set({
      hour: startingHour,
      minute: 0,
      second: 0
    });
  }

  nextWarDate(referenceDate) {
    const dayOfWeek = referenceDate.isoWeekday();
    const hourOfDay = referenceDate.hours();

    let nextWarDate;

    if (dayOfWeek == this.saturday) {
      if (hourOfDay < this.weekendWarStartEnd) {
        nextWarDate = moment.utc(referenceDate);
        this.setTime(nextWarDate, this.weekendWarStartEnd);
      } else {
        nextWarDate = this.getNextWeekWednesdayWar(referenceDate);
      }
    }

    if(dayOfWeek == this.sunday) {
      nextWarDate = this.getNextWeekWednesdayWar(referenceDate);
    }

    if(dayOfWeek == this.monday || dayOfWeek == this.tuesday){
      nextWarDate = this.getNextWarInSameWeek(referenceDate, this.wednesday, this.weekWarStartEnd);
    }

    if(dayOfWeek == this.wednesday) {
      if(hourOfDay < this.weekWarStartEnd) {
        nextWarDate = moment.utc(referenceDate);
        this.setTime(nextWarDate, this.weekWarStartEnd);
      } else {
        nextWarDate = this.getNextWarInSameWeek(referenceDate, this.saturday, this.weekendWarStartEnd);
      }
    }

    if(dayOfWeek == this.thursday || dayOfWeek == this.friday){
      nextWarDate = this.getNextWarInSameWeek(referenceDate, this.saturday, this.weekendWarStartEnd);
    }

    console.log('Next war:', nextWarDate.format());

    return nextWarDate;
  }

  nextWar(referenceDate) {
    let nextWarStart = this.nextWarDate(referenceDate);
    return nextWarStart.diff(referenceDate);
  }
}

module.exports = new Events();