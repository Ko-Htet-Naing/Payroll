const { Op } = require("sequelize");
const moment = require("moment");
const { LeaveRecord, Attendance } = require("../models");
const leaveRecodHelper = require("./LeaveRecordHelper");

async function createNewLeaveRequest(objects) {
  try {
    const getDatesInRange = (startDate, endDate) => {
      console.log("start date", startDate);
      console.log("end date", endDate);
      const dates = new Set();
      let currentDate = moment(startDate);

      while (currentDate.isSameOrBefore(endDate, "day")) {
        dates.add(currentDate.format("YYYY-MM-DD"));
        currentDate.add(1, "days");
      }
      console.log("dates", dates);
      return dates;
    };

    const doesLeaveOverlapWithAttendance = async (
      leaveStartDate,
      leaveEndDate,
      userId
    ) => {
      const leaveDates = getDatesInRange(leaveStartDate, leaveEndDate);
      const attendanceRecords = await Attendance.findAll({
        where: {
          UserId: userId,
          date: { [Op.between]: [leaveStartDate, leaveEndDate] },
        },
      });
      const attendanceDates = new Set(
        attendanceRecords.map((record) => record.date)
      );

      for (let date of leaveDates) {
        if (attendanceDates.has(date)) {
          return true;
        }
      }
      return false;
    };

    const existingRequest = await LeaveRecord.findOne({
      where: {
        UserId: objects.UserId,
        from: objects.from,
        to: objects.to,
        leaveType: objects.leaveType,
      },
    });
    let decrementLeave;

    if (existingRequest === null) {
      if (
        objects.leaveType === "Morning Leave" ||
        objects.leaveType === "Evening Leave"
      ) {
        decrementLeave = await leaveRecodHelper.decrementLeaveCount(objects);
        if (decrementLeave.success === true) {
          await LeaveRecord.create(objects);
          return { success: true, message: "Successfully created" };
        }
        return { success: false, message: decrementLeave.message };
      }

      const overlap = await doesLeaveOverlapWithAttendance(
        objects.from,
        objects.to,
        objects.UserId
      );
      if (!overlap) {
        decrementLeave = await leaveRecodHelper.decrementLeaveCount(objects);
        if (decrementLeave.success === true) {
          await LeaveRecord.create(objects);
          return { success: true, message: "Successfully created" };
        }
        return { success: false, message: decrementLeave.message };
      } else {
        return {
          success: false,
          message: "Already record in Attendance Record",
        };
      }
    } else {
      return { success: false, message: "Already requested to HRs" };
    }
  } catch (error) {
    console.log("Error while adding new user : ", error);
    throw new Error(error);
  }
}
module.exports = { createNewLeaveRequest };
