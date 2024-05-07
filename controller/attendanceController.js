const moment = require("moment");
const { Attendance } = require("../models");

const getAttendance = async (req, res) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);

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

  // pagination

  const attendanceWithCount = await Attendance.findAndCountAll({
    limit: size,
    offset: page * size,
  });
  res.send({
    content: attendanceWithCount.rows,
    totalPages: Math.ceil(attendanceWithCount.count / Number.parseInt(size)),
  });
};

const createAttendance = async (req, res) => {
  console.log("time", moment().format("MMMM Do YYYY, h:mm:ss a"));
  try {
    const { in_time, out_time, date, UserId } = req.body;

    // const dateString = moment(date, "DD/MM/yyyy").format();
    // const dateType = new Date(dateString);
    // console.log("Date: ", dateType);

    // const [day, month, year] = date.split("/");
    // const dateFormat = new Date(`${year}-${month}-${day}`)
    // console.log("date Format", dateFormat);
    // const parseDate = new Date(date);
    // const formattedDate = format(parseDate, "dd/MM/yyyy");
    // console.log("formatted date", formattedDate);

    const beginningTime = moment("08:45", "HH:mm");
    const endTime = moment("16:45", "HH:mm");
    console.log("beginning Time", beginningTime);
    console.log("end time", endTime);
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
      // const late_in = lateInTime.toString();

      // const early_out = earlyOutTime.toString();
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
