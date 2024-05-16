const moment = require("moment");
const { Attendance, Users, Department } = require("../models");
const { Op } = require("sequelize");

// get the list of attendance
const getAttendance = async (req, res) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const username = req.query.username;

  let page = 0;
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    page = pageAsNumber;
  }

  // show 10 attendances
  let size = 10;
  if (
    !Number.isNaN(sizeAsNumber) &&
    !(sizeAsNumber > 10) &&
    !(sizeAsNumber < 1)
  ) {
    size = sizeAsNumber;
  }

  const totalCount = await Attendance.count();
  // to get totacl Attendance Count in today
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero indexed, so add 1
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  // console.log("formatted data", formattedDate);
  // console.log("total Count", totalCount);

  const totalCountToday = await Attendance.count({
    where: { date: formattedDate },
  });
  //console.log("totalCountToday", totalCountToday);
  const totalPage = Math.ceil(totalCount / size);

  try {
    let whereUsername = {};
    let whereClause = {};

    // filter by date
    if (fromDate || toDate) {
      whereClause.date = { [Op.between]: [fromDate, toDate] };
    }
    if (username) {
      whereUsername.username = {
        [Op.like]: `%${username}%`,
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Users,
          attributes: ["username", "Position"],
          where: whereUsername,
          include: [{ model: Department, attributes: ["deptName"] }],
        },
      ],
      limit: size,
      offset: page * size,
    });
    if (!attendance) return res.status(404).json("Attendance not found");
    res.status(200).json({ data: attendance, totalPage, totalCountToday });
  } catch (error) {
    console.error(error);
  }
};

module.exports = { getAttendance };
