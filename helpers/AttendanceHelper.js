const { Users, Attendance, Department } = require("../models");
const { Op } = require("sequelize");

async function getTotalAttendanceCount() {
  const totalCount = await Attendance.count({
    where: { UserId: { [Op.not]: null } },
  });
  return totalCount;
}

async function getTotalAttendacneCountByUserId(userId) {
  const totalCount = await Attendance.count({ where: { UserId: userId } });
  return totalCount;
}

async function getAttendanceList({
  page,
  size = 10,
  username,
  userId,
  fromDate,
  toDate,
  position,
  department,
  employeeId,
}) {
  try {
    const whereClause = {
      ...(fromDate &&
        toDate && {
          date: { [Op.between]: [fromDate, toDate] },
        }),
      ...(userId && { UserId: userId }),
    };

    const whereUser = {
      ...(username && { username: { [Op.like]: `%${username}%` } }),
      ...(position && { Position: { [Op.like]: `%${position}%` } }),
      ...(employeeId && { EmployeeId: { [Op.like]: `%${employeeId}%` } }),
    };

    const userInclude = {
      where: whereUser,
      model: Users,
      attributes: ["username", "EmployeeId", "Position"],
      include: [
        {
          model: Department,
          attributes: ["deptName"],
          ...(department && { where: { deptName: department } }),
        },
      ],
    };

    const order = [["date", "DESC"]];
    const attendanceList = await Attendance.findAll({
      where: whereClause,
      include: [userInclude],
      order: order,
      limit: size,
      offset: page * size,
    });

    return attendanceList;
  } catch (error) {
    console.error("Error fetching attendancce records:", error);
    throw error;
  }
}
module.exports = {
  getAttendanceList,
  getTotalAttendanceCount,
  getTotalAttendacneCountByUserId,
};
