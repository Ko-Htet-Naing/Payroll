const { Attendance } = require("../models");

class AttendanceClickHelper {
  static async checkUserAlreadyExistsInDB(userId, currentDate) {
    const userExists = await Attendance.findOne({
      where: { UserId: userId, date: currentDate },
    });
    return userExists ? true : false;
  }

  static async checkUserDataExistInCurrentMorningAndEvening(
    period,
    userId,
    currentDate
  ) {
    const specificTime = period === "AM" ? "in_time" : "out_time";
    const isValidUsercheckIn = await Attendance.findOne({
      where: { UserId: userId, date: currentDate },
      attributes: [specificTime],
    });

    if (
      isValidUsercheckIn === null ||
      isValidUsercheckIn[specificTime] === null
    ) {
      return false; // User Data မရှိနေရင် ပေး အလုပ်လုပ်
    } else {
      // User Data ရှိနေရင် အလုပ်ပေးမလုပ်ပါဘူး
      return true;
    }
  }

  // မနက်ပိုင်း click ဖို့မေ့သွားရင်
  static async checkMorningClickStatus(userId, currentDate) {
    const userExists = await Attendance.findOne({
      where: { UserId: userId, date: currentDate },
      attributes: ["in_time"],
    });
    return userExists ? true : false;
  }

  static async checkApprovedLeaveList(userId) {}
}

module.exports = AttendanceClickHelper;
