const { Op } = require("sequelize");
const moment = require("moment");
const { LeaveRecord, Users, Department } = require("../models"); // Adjust the import according to your project structure

async function getTotalLeaveCount() {
  const totalCount = await LeaveRecord.count({
    where: { UserId: { [Op.not]: null } },
  });
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
  position,
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
      ...(employeeId && { EmployeeId: { [Op.like]: `%${employeeId}%` } }),
      ...(position && { Position: { [Op.like]: `%${position}%` } }),
    };

    const userInclude = {
      where: whereUser,
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

    const result = leaveList.map((leave) => ({
      id: leave.id,
      reason: leave.reasons,
      leaveType: leave.leaveType,
      status: leave.status,
      from: leave.from,
      to: leave.to,
      attachmentUrl: leave.attachmentUrl,
      userId: leave.UserId,
      username: leave.User.username,
      position: leave.User.Position,
      employeeId: leave.User.EmployeeId,
      departmentName: leave.User.Department.deptName,
      createdAt: leave.createdAt,
    }));

    return result;
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

async function decrementLeaveCount(leaveRecords) {
  const user = await Users.findByPk(leaveRecords.UserId);
  const leaveDays = calculateLeaveDays(leaveRecords.from, leaveRecords.to);

  switch (leaveRecords.leaveType) {
    case "Medical Leave":
      if (leaveDays > user.MedicalLeave) {
        return { success: false, message: "Do not have medical leave" };
      }
      await user.decrement("MedicalLeave", { by: leaveDays });
      return { success: true };

    case "Annual Leave":
      if (leaveDays > user.AnnualLeave) {
        return { success: false, message: "Insufficient annual leave balance" };
      }
      if (!isAfterThreeDays(leaveRecords.from)) {
        return {
          success: false,
          message:
            "Cannot apply annual leave, start date must be at least 3 days in the future",
        };
      }
      await user.decrement("AnnualLeave", { by: leaveDays });
      return { success: true };

    case "Morning Leave":
    case "Evening Leave":
      if (user.MedicalLeave === 0) {
        return { success: false, message: "Do not have medical leave" };
      }
      await user.decrement("MedicalLeave", { by: 0.5 });
      return { success: true };
    default:
      return { success: false };
  }
}

module.exports = {
  getTotalLeaveCount,
  getLeaveList,
  getTotalLeaveCountByUserId,
  incrementLeaveCount,
  decrementLeaveCount,
};
