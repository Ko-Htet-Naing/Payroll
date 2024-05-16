const { Attendance, Department, Users, LeaveRecord } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

const getUserCount = async (req, res) => {
  // Get current date
  const currentDate = moment().format("YYYY-MM-DD");

  // Get all user id who attended today
  const getAllUserId = async () => {
    try {
      let id = await Attendance.findAll({
        attributes: ["UserId"],
        where: {
          date: currentDate,
        },
      });
      return id.map((user) => user.UserId);
    } catch (error) {
      console.log("Error While Fetching Data", error);
      return [];
    }
  };
  // Fetch department id and name from department table
  const getAllDepartmentNameAndId = async () => {
    try {
      let departmentIdAndName = await Department.findAll({
        attributes: ["id", "deptName"],
      });
      return departmentIdAndName
        .map((department) => ({
          [parseInt(department.id)]: department.deptName,
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {});
    } catch (error) {
      console.log("Error occur while getting department id and name : ", error);
      return [];
    }
  };
  // Get Today user count
  const totalUserCount = async () => {
    return await Attendance.count({
      where: {
        date: currentDate,
      },
    });
  };

  // Get Department Count Realting with id
  const getAttendanceWithDepartment = async (userIds) => {
    try {
      const attendanceRecords = await Users.findAll({
        where: {
          id: userIds,
        },
        attributes: ["DepartmentId"],
      });
      const departmentName = await getAllDepartmentNameAndId(); // Fetch department names before reduce

      const department = await attendanceRecords.reduce(
        async (countsPromise, record) => {
          const counts = await countsPromise; // Wait for the countsPromise to resolve
          const departmentId = record.DepartmentId;
          const currentDepartmentName = departmentName[departmentId];
          counts[currentDepartmentName] =
            (counts[currentDepartmentName] || 0) + 1;
          return counts;
        },
        Promise.resolve({})
      ); // Start reduce with a resolved promise
      return department;
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
        res.status(200).json({
          employeeList: await totalUserCount(),
          departmentCount: DepartmentIds,
        });
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
