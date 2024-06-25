const { Op } = require("sequelize");
const moment = require("moment");
const { LeaveRecord, Attendance } = require("../models");
const leaveRecodHelper = require("./LeaveRecordHelper");

const getDatesInRange = (startDate, endDate) => {
  console.log("start date", startDate);
  console.log("end date", endDate);
  //const dates = new Set();
  let dates = [];
  let currentDate = moment(startDate);

  while (currentDate.isSameOrBefore(endDate, "day")) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "days");
  }
  // console.log("dates", dates);
  return dates;
};
async function createNewLeaveRequest(objects) {
  try {
    // const getDatesInRange = (startDate, endDate) => {
    //   console.log("start date", startDate);
    //   console.log("end date", endDate);
    //   //const dates = new Set();
    //   let dates = [];
    //   let currentDate = moment(startDate);

    //   while (currentDate.isSameOrBefore(endDate, "day")) {
    //     dates.push(currentDate.format("YYYY-MM-DD"));
    //     currentDate.add(1, "days");
    //   }
    //   // console.log("dates", dates);
    //   return dates;
    // };

    const doesLeaveOverlapWithNewLeave = async (
      leaveStartDate,
      leaveEndDate,
      userId
    ) => {
      const leaveDates = getDatesInRange(leaveStartDate, leaveEndDate);
      console.log("leave date", leaveDates);
      const existingLeaveRecords = await LeaveRecord.findAll({
        where: {
          UserId: userId,
        },
      });

      console.log("existing leave", existingLeaveRecords);
      for (let record of existingLeaveRecords) {
        const existingLeaveDates = getDatesInRange(record.from, record.to);

        console.log("existing leave date", existingLeaveDates);
        for (let date of leaveDates) {
          if (existingLeaveDates.includes(date)) {
            return true; // Overlap found
          }
        }
      }
      return false;
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

      // No overlap

      // const leaveRecords = await LeaveRecord.findAll({
      //   where: {
      //     UserId: userId,
      //     // from: { [Op.between]: [leaveStartDate, leaveEndDate] },
      //     // to: { [Op.between]: [leaveStartDate, leaveEndDate] },
      //   },
      // });
      // console.log("leave record", leaveRecords);
      // const leaveDate = [];

      // leaveRecords.map((record) => {
      //   leaveDate.push(getDatesInRange(record.from, record.to));
      // });

      // console.log("leave Date", leaveDate);

      // for (let leave of leaveDates) {
      //   if (leaveDates.map(leave)) {
      //     //return true
      //     console.log("overlap");
      //   } else {
      //     console.log("no overlap");
      //   }
      // }
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

    // const existingRequest = await LeaveRecord.findOne({
    //   where: {
    //     UserId: objects.UserId,
    //     from: objects.from,
    //     to: objects.to,
    //   },
    // });
    let decrementLeave;

    const overlapLeave = await doesLeaveOverlapWithNewLeave(
      objects.from,
      objects.to,
      objects.UserId
    );
    console.log("overlap Leave", overlapLeave);
    if (!overlapLeave) {
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
      console.log("overlap attendance", overlap);
      if (!overlap === !overlapLeave) {
        decrementLeave = await leaveRecodHelper.decrementLeaveCount(objects);
        if (decrementLeave?.success === true) {
          await LeaveRecord.create(objects);
          return { success: true, message: "Successfully created" };
        }
        return { success: false, message: "Already requested to HRs" };
      } else {
        return {
          success: false,
          message: "Already record in Attendance Record",
        };
      }
    } else {
      return { success: false, message: "Do not have leave count" };
    }
  } catch (error) {
    console.log("Error while adding new user : ", error);
    throw new Error(error);
  }
}
module.exports = { createNewLeaveRequest, getDatesInRange };
