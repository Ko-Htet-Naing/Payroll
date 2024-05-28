const moment = require("moment");
const { Holidays } = require("../models");

class HolidayHelper {
  static async iterateEachItemAndSetToDB(dates) {
    try {
      dates.map((date) => {
        Holidays.create({ date: date });
      });
    } catch (error) {
      console.log("Error while adding date");
      throw new Error(error);
    }
  }
}

module.exports = HolidayHelper;
