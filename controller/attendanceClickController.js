const moment = require("moment");
const { format, isSameDay, parse } = require("date-fns");
const { Attendance } = require("../models");
const AttendanceClickHelper = require("../helpers/AttendanceClickHelper");

// Helper function to get predefined date and time
const getPredefinedDateTime = (chooseDayTime) => {
  const currentDate = moment().format("YYYY-MM-DD");
  const customTime = chooseDayTime === "AM" ? "08:30:00" : "16:30:00";
  return moment(`${currentDate}T${customTime}`);
};

// Main function to handle real-time click
const realTimeClick = async (req, res) => {
  const { dateTime, userId } = req.body;
  if (!dateTime || !userId) {
    return res.status(404).send("Date Time or User ID is missing.");
  }

  const userArrivalDate = format(dateTime.split(" ")[0], "yyyy-MM-dd");
  const userArrivalTime = dateTime.split(" ")[1];

  if (!isSameDay(format(new Date(), "yyyy-MM-dd"), userArrivalDate)) {
    return res.status(404).send("Mismatched date.");
  }

  const period = format(new Date(dateTime), "a");
  const predefinedTime = getPredefinedDateTime(period);
  const timeDifference = moment(dateTime).diff(predefinedTime, "minutes");

  const userExists = await AttendanceClickHelper.checkUserAlreadyExistsInDB(
    userId,
    userArrivalDate
  );
  const periodStatus =
    await AttendanceClickHelper.checkUserDataExistInCurrentMorningAndEvening(
      period,
      userId,
      userArrivalDate
    );

  if (periodStatus) {
    return res.status(401).send(`You already checked in for ${period}.`);
  }

  const attendanceData = {
    ...(period === "AM" && { in_time: userArrivalTime }),
    UserId: userId,
    date: userArrivalDate,
    ...(period === "PM" && { out_time: userArrivalTime }),
    ...(timeDifference > 0 && { late_in_time: timeDifference }),
    ...(timeDifference < 0 && { early_out_time: -timeDifference }),
  };
  console.log(timeDifference);
  // မနက်ပိုင်း click ဖို့ မေ့သွားရင်
  // if (
  //   !(await AttendanceClickHelper.checkMorningClickStatus(
  //     userId,
  //     userArrivalDate
  //   ))
  // )
  //   return res.status(400).send("You missing click on early");
  if (userExists) {
    await Attendance.update(attendanceData, {
      where: { UserId: userId, date: userArrivalDate },
    });
  } else {
    await Attendance.create(attendanceData);
  }

  return res.status(200).send({ success: true });
};

module.exports = {
  realTimeClick,
};
