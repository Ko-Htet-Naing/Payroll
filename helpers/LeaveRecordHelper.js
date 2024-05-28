const { Op } = require("sequelize");
const moment = require("moment");
const { LeaveRecord, Users, Department } = require("../models"); // Adjust the import according to your project structure

async function getTotalLeaveCount() {
  try {
    const totalCount = await LeaveRecord.count();
    return totalCount;
  } catch (error) {
    console.error("Error counting leave records:", error);
    throw error;
  }
}

async function getTotalLeaveCountByUserId(userId) {
  try {
    const totalCount = await LeaveRecord.count({ where: { UserId: userId } });
    return totalCount;
  } catch (error) {
    console.error("Error counting leave records:", error);
    throw error;
  }
}

async function getLeaveList({
  page = 0,
  size = 10,
  username,
  userId,
  from,
  to,
  status,
}) {
  try {
    let whereClause = {};
    let whereUsername = {};

    if (from && to) {
      whereClause.from = { [Op.between]: [from, to] };
      whereClause.to = { [Op.between]: [from, to] };
    }

    if (status) {
      whereClause.status = status;
    }

    if (userId) {
      whereClause.UserId = userId;
    }

    if (username) {
      whereUsername.username = {
        [Op.like]: `%${username}%`,
      };
    }

    const leaveList = await LeaveRecord.findAll({
      where: whereClause,
      include: [
        {
          model: Users,
          where: whereUsername,
          attributes: ["username", "DepartmentId", "Position"],
          include: [{ model: Department, attributes: ["deptName"] }],
        },
      ],
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
  const users = await Users.findByPk(leaveRecord.UserId);
  if (leaveRecord.leaveType === "Medical Leave" && users.MedicalLeave < 6) {
    await users.increment("MedicalLeave", { by: 1 });
  }

  const leaveDays = calculateLeaveDays(leaveRecord.from, leaveRecord.to);
  if (leaveRecord.leaveType === "Annual Leave" && users.AnnualLeave < 16) {
    await users.increment("AnnualLeave", {
      by: leaveDays,
    });
  }
  if (
    leaveRecord.leaveType === "Morning Leave" ||
    (leaveRecord.leaveType === "Evening Leave" && users.MedicalLeave < 6)
  ) {
    await users.increment("MedicalLeave", { by: 0.5 });
  }
}

async function decrementLeaveCount(leaveRecords) {
  const users = await Users.findByPk(leaveRecords.UserId);
  if (leaveRecords.leaveType === "Medical Leave") {
    if (users.MedicalLeave === 0) {
      return res.status(400).json({
        message: "Do not have medical leave",
        success: false,
      });
    } else {
      await users.decrement("MedicalLeave", { by: 1 });
    }
  }
  if (leaveRecords.leaveType === "Annual Leave") {
    const leaveDays = calculateLeaveDays(leaveRecords.from, leaveRecords.to);

    // 3ရက်  ကြိုပြီး leave တင်ရ မယ်
    if (!isAfterThreeDays(leaveRecords.from)) {
      return res.status(400).json({
        message:
          "Cannot apply annual leave, start date must be at least 3 days in the future",
        success: false,
      });
    }

    if (leaveDays > users.AnnualLeave) {
      return res.status(400).json({
        message: "Insufficient annual leave balance",
        success: false,
      });
    }

    await users.decrement("AnnualLeave", { by: leaveDays });
  }

  if (leaveRecords.leaveType === "Morning Leave") {
    if (users.MedicalLeave === 0) {
      return res.status(400).json({
        message: "Do not have medical leave",
        success: false,
      });
    } else {
      await users.decrement("MedicalLeave", { by: 0.5 });
    }
  }
  if (leaveRecords.leaveType === "Evening Leave") {
    if (users.MedicalLeave === 0) {
      return res.status(400).json({
        message: "Do not have medical leave",
        success: false,
      });
    } else {
      await users.decrement("MedicalLeave", { by: 0.5 });
    }
  }
}

module.exports = {
  getTotalLeaveCount,
  getLeaveList,
  getTotalLeaveCountByUserId,
  incrementLeaveCount,
  decrementLeaveCount,
};
