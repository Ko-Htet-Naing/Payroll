const { Attendance, Department, Users, LeaveRecord } = require("../models");
const { Op } = require("sequelize");
const getUserCount = async (req, res) => {
  const getAllUserId = async () => {
    try {
      let id = await Attendance.findAll({
        attributes: ["UserId"],
      });
      return id.map((user) => user.UserId);
    } catch (error) {
      console.log("Error While Fetching Data", error);
      return [];
    }
  };

  // Get Department Count Realting with id
  const getAttendanceWithDepartment = async (userIds) => {
    console.log(userIds);
    try {
      const attendanceRecords = await Users.findAll({
        where: {
          id: userIds,
        },
        attributes: ["DepartmentId"],
      });
      console.log(attendanceRecords);
      return attendanceRecords.map((record) => record.DepartmentId);
    } catch (err) {
      console.log("Error while counting department", err);
      return [];
    }
  };

  // Combine All Id and Department Data
  const getAllEmployee = async () => {
    try {
      const totalId = await getAllUserId();
      if (totalId.length > 0) {
        const DepartmentIds = await getAttendanceWithDepartment(totalId);
        console.log(DepartmentIds);
      }
    } catch (err) {
      console.log("Error occur while combining id and department", err);
      return [];
    }
  };
  await getAllEmployee();

  const today = new Date();
  console.log("today", today);
  today.setHours(0, 0, 0, 0);
  // get leave count for today
  const getLeaveCount = await LeaveRecord.count({
    where: {
      from: { [Op.lte]: today },
      to: { [Op.gte]: today },
    },
  });
  res.json({ leaveCount: getLeaveCount });
};

module.exports = { getUserCount };
