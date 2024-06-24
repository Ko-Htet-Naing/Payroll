class dateHelper {
  static async totalDays(startDate, endDate) {
    let Difference_In_Time = endDate.getTime() - startDate.getTime();

    // Calculating the no. of days between two dates
    let totalDays = Math.round(Difference_In_Time / (1000 * 3600 * 24)) + 1;

    return totalDays;
  }
  // တလစာ weekend ရဲ့ list
  static getWeekends(startDate, endDate) {
    let currentDate = new Date(startDate);
    console.log("current Date", endDate);
    let weekends = [];
    let count = 0;

    while (
      currentDate.toISOString().slice(0, 10) <=
      endDate.toISOString().slice(0, 10)
    ) {
      // တနင်္ဂနွေနဲ့ စနေတို့ကို စစ်ဆေးမယ်။
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        weekends.push(currentDate.toISOString().slice(0, 10));
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("weekends", weekends);
    return { count, weekends };
  }
}
module.exports = dateHelper;
