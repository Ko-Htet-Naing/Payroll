const { Attendance, LeaveRecord } = require("../models");
const moment = require("moment");

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
  static getPredefinedDateTime(leaveType) {
    let startTime = null;
    let endTime = null;

    if (leaveType === "Morning Leave") {
      startTime = "12:30:00"; // Start time for morning leave
      endTime = "16:30:00"; // End time for morning leave
    } else if (leaveType === "Evening Leave") {
      startTime = "08:30:00"; // Start time for evening leave
      endTime = "12:30:00"; // End time for evening leave
    } else {
      startTime = "08:30:00"; // Default start time for no specific leave
      endTime = "16:30:00"; // Default end time for no specific leave
    }

    return { startTime, endTime };
  }

  static async checkUserMorningEveningLeave(userId, currentDate, leaveDetails) {
    const result = await LeaveRecord.findOne({
      where: { UserId: userId, from: currentDate, to: currentDate },
    });
    return result?.leaveType === leaveDetails && result?.status === "Approved"
      ? true
      : false;
  }
  static async getUserClick(userId, userArrivalDate) {
    const result = await Attendance.findOne({
      where: { UserId: userId, date: userArrivalDate },
    });
    return result;
  }
}

module.exports = AttendanceClickHelper;
