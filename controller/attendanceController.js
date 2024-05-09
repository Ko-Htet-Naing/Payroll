const moment = require("moment");
const { Attendance, Users } = require("../models");
const { Op, where } = require("sequelize");

// get the list of attendance
const getAttendance = async (req, res) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);
  const dateQuery = req.query?.date;
  const search = req.query.username;
  let attendanceWithCount = undefined;

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
  const totalPage = Math.ceil(totalCount / size);

  // filter by date and search by username
  if (dateQuery && !search) {
    attendanceWithCount = await Attendance.findAll({
      include: [
        {
          model: Users,
          attributes: ["username"],
        },
      ],
      where: {
        date: dateQuery,
      },

      limit: size,
      offset: page * size,
    });
  } else if (dateQuery && search) {
    attendanceWithCount = await Attendance.findAll({
      include: [
        {
          model: Users,
          attributes: ["username"],
          where: { username: { [Op.like]: `%${search}%` } },
        },
      ],
      where: {
        date: dateQuery,
      },
      limit: size,
      offset: page * size,
    });
  } else if (dateQuery && !search) {
    attendanceWithCount = await Attendance.findAll({
      include: [
        {
          model: Users,
          attributes: ["username"],
          where: { username: { [Op.like]: `%${search}%` } },
        },
      ],
      limit: size,
      offset: page * size,
    });
  } else if (!dateQuery && !search) {
    attendanceWithCount = await Attendance.findAll({
      include: [
        {
          model: Users,
          attributes: ["username"],
        },
      ],
      limit: size,
      offset: page * size,
    });
  }

  res.json({ data: attendanceWithCount, totalPage });
};

// create new attendance
const createAttendance = async (req, res) => {
  console.log("time", moment().format("MMMM Do YYYY, h:mm:ss a"));
  try {
    const { in_time, out_time, date, UserId } = req.body;

    const beginningTime = moment("08:45", "HH:mm");
    const endTime = moment("16:45", "HH:mm");
    const timeLimit = 0;

    //convert inTime and outTime to moment objects
    const inTimeMoment = moment(in_time, "HH:mm:ss");
    const outTimeMoment = moment(out_time, "HH:mm:ss");

    //calculate latInTime and earlyOutTime
    const lateInTime = inTimeMoment.isAfter(beginningTime)
      ? inTimeMoment.diff(beginningTime, "minutes")
      : 0;

    console.log(lateInTime);
    const earlyOutTime = outTimeMoment.isBefore(endTime)
      ? endTime.diff(outTimeMoment, "minutes")
      : 0;

    console.log(earlyOutTime);

    if (lateInTime <= timeLimit && earlyOutTime <= timeLimit) {
      const newAttendance = await Attendance.create({
        in_time,
        out_time,
        date,
        UserId,
      });

      if (!newAttendance) return res.status(404).send("Attendance not found");

      res.json({ message: "attendance created" });
    } else {
      res.json({ message: "absent" });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports = { createAttendance, getAttendance };
