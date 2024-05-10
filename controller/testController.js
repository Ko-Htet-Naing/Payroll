const { Attendance, Users } = require("../models");

const getAllAttendance = async (req, res) => {
  const data = await Attendance.findAll({
    include: [
      {
        model: Users,
        attributes: ["username", "Email", "Department"],
      },
    ],
    attributes: ["inTime", "outTime", "date"],
  });
  console.log(data);
};

module.exports = getAllAttendance;
