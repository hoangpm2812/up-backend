export class Constant {
  static EARTH_RADIUS = 6371000;
  static MAX_NEAR_DISTANCE = 10000;
  static MAX_REFILL_DISTANCE = 100;

  static STEPCOUNT_PER_POINT = 20;
  static POINT_PER_REFILL = 5;
  static CALORIES_PER_STEP = 0.04;
  static DISTANCE_PER_STEP = 0.762;

  static MAX_EXCHANGE_DUEDATE = 15;

  static MILLISEC_PER_DAY = 86400000;
  static STEP_COUNT_DATE_TIME_FORMAT = 'dd/mm';

  static TOKEN_EXPIRES = 86400 * 7;

  static MAX_STEP_HISTORY_RESPONSE_NUMBER = 30;
  static MAX_REFILL_LOCATION_RESPONSE_NUMBER = 10;
  static STATE = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BAN: 'ban',
  };

  static HOST = 'http://35.185.47.170:3000/';
}
