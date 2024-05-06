const moment = require("moment");
const { Attendance } = require("../models");

const createAttendance = async (req, res) => {
  console.log("time", moment().format("MMMM Do YYYY, h:mm:ss a"));
  try {
    const { in_time, out_time, date, UserId } = req.body;

    const beginningTime = moment("08:45", "HH:mm");
    const endTime = moment("16:45", "HH:mm");
    const timeLimit = 30;

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
      const late_in = lateInTime.toString();

      const early_out = earlyOutTime.toString();
      const newAttendance = await Attendance.create({
        in_time,
        out_time,
        late_in,
        early_out,
        date,
        UserId,
      });
      // await Attendance.update({ late_in: lateInTime, early_out: earlyOutTime });
      if (!newAttendance) return res.status(404).send("Attendance not found");

      res.json({ message: "attendance created" });
    } else {
      res.json({ message: "absent" });
    }
  } catch (error) {}
};
module.exports = { createAttendance };
