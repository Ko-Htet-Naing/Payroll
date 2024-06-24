const { Attendance, Department, Users, LeaveRecord } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

const getLeaveCountByUserId = async (req, res) => {
  const { id } = req.params;

  const user = await Users.findByPk(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  console.log(user);
  res.status(200).json({
    medicalLeave: user.MedicalLeave,
    annualLeave: user.AnnualLeave,
    attendanceLeave: user.AttendanceLeave,
  });
};

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
  // Get All user count
  const getTotalEmployeeCount = async () => {
    try {
      return await Users.count();
    } catch (error) {
      console.log("Error while getting total employee count : ", error);
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

  const getLeaveCount = async () => {
    return await LeaveRecord.count({
      where: {
        from: { [Op.lte]: currentDate },
        to: { [Op.gte]: currentDate },
        status: "Approved",
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
      // res.status(200).json({ leaveList: await getLeaveCount() });
      if (totalId.length > 0) {
        const DepartmentIds = await getAttendanceWithDepartment(totalId);
        res.status(200).json({
          //employeeList: await getTotalEmployeeCount(),
          departmentCount: DepartmentIds,
          totalAttendanceCount: await totalUserCount(),
          leaveList: await getLeaveCount(),
        });
      } else {
        res.status(200).send("ဒီနေ့ဘယ်သူမှ ရုံးမတက်ပါ...");
      }
    } catch (err) {
      console.log("Error occur while combining id and department", err);
      return [];
    }
  };
  await getAllEmployee();
};

module.exports = { getUserCount, getLeaveCountByUserId };
