const moment = require('moment');
const createLogger = require('logging');
const days = require('./days.js');

class Events {
  constructor() {
    this.weekendWarStartEnd = 20;
    this.weekWarStartEnd = 11;
    this.logger = createLogger.default('Events');
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
      second: 0,
      millisecond: 0
    });
  }

  nextWarDate(referenceDate) {
    const dayOfWeek = referenceDate.isoWeekday();
    const hourOfDay = referenceDate.hours();

    let nextWarDate;

    if (dayOfWeek == days.SATURDAY) {
      if (hourOfDay < this.weekendWarStartEnd) {
        nextWarDate = moment.utc(referenceDate);
        this.setTime(nextWarDate, this.weekendWarStartEnd);
      } else {
        nextWarDate = this.getNextWeekWednesdayWar(referenceDate);
      }
    }

    if(dayOfWeek == days.SUNDAY) {
      nextWarDate = this.getNextWeekWednesdayWar(referenceDate);
    }

    if(dayOfWeek == days.MONDAY || dayOfWeek == days.TUESDAY){
      nextWarDate = this.getNextWarInSameWeek(referenceDate, this.wednesday, this.weekWarStartEnd);
    }

    if(dayOfWeek == days.WEDNESDAY) {
      if(hourOfDay < this.weekWarStartEnd) {
        nextWarDate = moment.utc(referenceDate);
        this.setTime(nextWarDate, this.weekWarStartEnd);
      } else {
        nextWarDate = this.getNextWarInSameWeek(referenceDate, this.saturday, this.weekendWarStartEnd);
      }
    }

    if(dayOfWeek == days.THURSDAY || dayOfWeek == days.FRIDAY){
      nextWarDate = this.getNextWarInSameWeek(referenceDate, this.saturday, this.weekendWarStartEnd);
    }

    this.logger.info('Next war:', nextWarDate.format());

    return nextWarDate;
  }

  nextWar(referenceDate) {
    let nextWarStart = this.nextWarDate(referenceDate);
    return nextWarStart.diff(referenceDate);
  }
}

module.exports = new Events();