const moment = require('moment');
const createLogger = require('logging');
const days = require('./days.js');

class Events {
  constructor() {
    this.weekendWarHourStartEnd = 18;
    this.weekendWarMinuteStartEnd = 30;
    this.weekWarHourStartEnd = 11;
    this.weekWarMinuteStartEnd = 0;
    this.logger = createLogger.default('Events');
  }

  getNextWarDate(referenceDate, isoDay, addWeek, startingHour, startingMinute) {
    let nextWarDay = moment.utc(referenceDate);

    if(addWeek) {
      nextWarDay = nextWarDay.add(1, 'w');
    }

    nextWarDay = nextWarDay.isoWeekday(isoDay);
    this.setTime(nextWarDay, startingHour, startingMinute);
    return nextWarDay;
  }

  setTime(momentDate, startingHour, startingMinute) {
    momentDate.set({
      hour: startingHour,
      minute: startingMinute,
      second: 0,
      millisecond: 0
    });
  }

  nextWarDate(referenceDate) {
    const dayOfWeek = referenceDate.isoWeekday();
    const hourOfDay = referenceDate.hours();

    let nextWarDate;

    if (dayOfWeek == days.SATURDAY) {
      if (hourOfDay < this.weekendWarHourStartEnd) {
        nextWarDate = moment.utc(referenceDate);
        this.setTime(nextWarDate, this.weekendWarHourStartEnd, this.weekendWarMinuteStartEnd);
      } else {
        nextWarDate = this.getNextWarDate(referenceDate, days.WEDNESDAY, true, this.weekWarHourStartEnd, this.weekWarMinuteStartEnd);
      }
    }

    if(dayOfWeek == days.SUNDAY) {
      nextWarDate = this.getNextWarDate(referenceDate, days.WEDNESDAY, true, this.weekWarHourStartEnd, this.weekWarMinuteStartEnd);
    }

    if(dayOfWeek == days.MONDAY || dayOfWeek == days.TUESDAY) {
      nextWarDate = this.getNextWarDate(referenceDate, days.WEDNESDAY, false, this.weekWarHourStartEnd, this.weekWarMinuteStartEnd);
    }

    if(dayOfWeek == days.WEDNESDAY) {
      this.logger.info(`hourOfDay = ${hourOfDay}`);
      if(hourOfDay < this.weekWarHourStartEnd) {
        nextWarDate = moment.utc(referenceDate);
        this.setTime(nextWarDate, this.weekWarHourStartEnd, this.weekWarMinuteStartEnd);
      } else {
        nextWarDate = this.getNextWarDate(referenceDate, days.SATURDAY, false, this.weekendWarHourStartEnd, this.weekendWarMinuteStartEnd);
      }
    }

    if(dayOfWeek == days.THURSDAY || dayOfWeek == days.FRIDAY){
      nextWarDate = this.getNextWarDate(referenceDate, days.SATURDAY, false, this.weekendWarHourStartEnd, this.weekendWarMinuteStartEnd);
    }

    this.logger.info('Next war:', nextWarDate.format());

    return nextWarDate;
  }

  untilNextWar(referenceDate) {
    const nextWarStart = this.nextWarDate(referenceDate);
    return moment.duration(nextWarStart.diff(referenceDate));
  }
}

module.exports = new Events();