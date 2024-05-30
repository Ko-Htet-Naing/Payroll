const moment = require("moment");
const { format, isSameDay, parse } = require("date-fns");
const { Attendance } = require("../models");
const AttendanceClickHelper = require("../helpers/AttendanceClickHelper");

// Main function to handle real-time click
const realTimeClick = async (req, res) => {
  const { dateTime, userId } = req.body;
  if (!dateTime || !userId) {
    return res.status(404).send("Date Time or User ID is missing.");
  }

  const userArrivalDate = format(dateTime.split(" ")[0], "yyyy-MM-dd");
  const userArrivalTime = dateTime.split(" ")[1];
  // Morning and Evening Leave checking
  const userAllowance =
    await AttendanceClickHelper.checkUserMorningEveningLeave(
      userId,
      userArrivalDate
    );

  if (!isSameDay(format(new Date(), "yyyy-MM-dd"), userArrivalDate)) {
    return res.status(404).send("Mismatched date.");
  }
  const period = format(new Date(dateTime), "a");
  const { startTime, endTime } = AttendanceClickHelper.getPredefinedDateTime(
    userAllowance ? userAllowance.leaveType : null
  );
  const currentTime = moment();
  const currentDate = moment().format("YYYY-MM-DD");
  const starttime = moment(
    `${currentDate} ${startTime}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const endtime = moment(`${currentDate} ${endTime}`, "YYYY-MM-DD HH:mm:ss");
  const checkUserInTimeStatusInDB =
    await AttendanceClickHelper.UserInTimeStatusInDB(userId, userArrivalDate);
  const timeDifference = {
    late: null,
    early: null,
  };

  console.log(checkUserInTimeStatusInDB);
  if (!checkUserInTimeStatusInDB) {
    timeDifference.late = currentTime.isAfter(starttime)
      ? currentTime.diff(starttime, "minutes")
      : 0;
  }
  timeDifference.early = currentTime.isBefore(endtime)
    ? endtime.diff(currentTime, "minutes")
    : 0;

  console.log("Return End time : ", starttime);
  console.log("End time : ", currentTime.isBefore(endtime));
  console.log("Late Time  Difference : ", timeDifference.late);
  const userExists = await AttendanceClickHelper.checkUserAlreadyExistsInDB(
    userId,
    userArrivalDate
  );

  if (userAllowance?.status === "Approved") {
    switch (userAllowance.leaveType) {
      case "Morning Leave":
        predefinedTime = AttendanceClickHelper.getPredefinedDateTime(
          period,
          userAllowance.leaveType
        );
        break;
      case "Evening Leave":
        break;
      default:
        return;
        break;
    }
  }
  console.log(userAllowance?.leaveType, userAllowance?.status);

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
    ...(timeDifference.late > 0 && { late_in_time: timeDifference.late }),
    ...(timeDifference.early < 0 && { early_out_time: timeDifference.early }),
  };
  console.log("early out time : ", timeDifference.early);
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
