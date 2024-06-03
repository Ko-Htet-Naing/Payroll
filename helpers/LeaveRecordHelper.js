const { Op } = require("sequelize");
const moment = require("moment");
const { LeaveRecord, Users, Department } = require("../models"); // Adjust the import according to your project structure

async function getTotalLeaveCount() {
  const totalCount = await LeaveRecord.count();
  return totalCount;
}

async function getTotalLeaveCountByUserId(userId) {
  const totalCount = await LeaveRecord.count({ where: { UserId: userId } });
  return totalCount;
}

async function getLeaveList({
  page = 0,
  size = 10,
  username,
  userId,
  from,
  to,
  status,
  department,
  leaveType,
  employeeId,
}) {
  try {
    const whereClause = {
      ...(from &&
        to && {
          from: { [Op.between]: [from, to] },
          to: { [Op.between]: [from, to] },
        }),
      ...(status && { status }),
      ...(userId && { UserId: userId }),
      ...(leaveType && { leaveType }),
    };
    const whereUser = {
      ...(username && { username: { [Op.like]: `%${username}%` } }),
      ...(employeeId && { EmployeeId: employeeId }),
    };

    const userInclude = {
      where: whereUser,
      //...(username && { where: { username: { [Op.like]: `%${username}%` } } }),
      model: Users,
      attributes: ["username", "DepartmentId", "Position", "EmployeeId"],
      include: [
        {
          model: Department,
          attributes: ["deptName"],
          ...(department && { where: { deptName: department } }),
        },
      ],
    };

    const order = [["id", "DESC"]];
    const leaveList = await LeaveRecord.findAll({
      where: whereClause,
      include: [userInclude],
      order: order,
      limit: size,
      offset: page * size,
    });
    return leaveList;
  } catch (error) {
    console.error("Error fetching leave records:", error);
    throw error;
  }
}

function calculateLeaveDays(from, to) {
  const start = moment(from);
  const end = moment(to);

  // Calculate the difference in days
  const leaveDays = end.diff(start, "days") + 1; // Adding 1 to include both the start and end dates

  return leaveDays;
}

function isAfterThreeDays(dateToCheck) {
  const fromdate = moment(dateToCheck);
  // Calculate the date 3 days from now
  const threeDaysFromNow = moment().add(3, "days");
  // Check if the provided date is after 3 days from now
  const isAfter = fromdate.isAfter(threeDaysFromNow, "day");
  return isAfter;
}

async function incrementLeaveCount(leaveRecord) {
  const user = await Users.findByPk(leaveRecord.UserId);
  const leaveDays = calculateLeaveDays(leaveRecord.from, leaveRecord.to);
  switch (leaveRecord.leaveType) {
    case "Medical Leave":
      if (user.MedicalLeave < 30) {
        await user.increment("MedicalLeave", { by: leaveDays });
      }
      break;
    case "Annual Leave":
      if (user.AnnualLeave < 16) {
        await user.increment("AnnualLeave", { by: leaveDays });
      }
      break;
    case "Morning Leave":
    case "Evening Leave":
      if (user.MedicalLeave < 30) {
        await user.increment("MedicalLeave", { by: 0.5 });
      }
      break;
  }
}

async function decrementLeaveCount(leaveRecords, res) {
  const user = await Users.findByPk(leaveRecords.UserId);
  const leaveDays = calculateLeaveDays(leaveRecords.from, leaveRecords.to);

  switch (leaveRecords.leaveType) {
    case "Medical Leave":
      if (user.MedicalLeave === 0) {
        return res.status(400).json({
          message: "Do not have medical leave",
          success: false,
        });
      }
      await user.decrement("MedicalLeave", { by: leaveDays });
      break;

    case "Annual Leave":
      if (!isAfterThreeDays(leaveRecords.from)) {
        return res.status(400).json({
          message:
            "Cannot apply annual leave, start date must be at least 3 days in the future",
          success: false,
        });
      }
      if (leaveDays > user.AnnualLeave) {
        return res.status(400).json({
          message: "Insufficient annual leave balance",
          success: false,
        });
      }
      await user.decrement("AnnualLeave", { by: leaveDays });
      break;

    case "Morning Leave":
    case "Evening Leave":
      if (user.MedicalLeave === 0) {
        return res.status(400).json({
          message: "Do not have medical leave",
          success: false,
        });
      }
      await user.decrement("MedicalLeave", { by: 0.5 });
      break;
  }
}

module.exports = {
  getTotalLeaveCount,
  getLeaveList,
  getTotalLeaveCountByUserId,
  incrementLeaveCount,
  decrementLeaveCount,
};
