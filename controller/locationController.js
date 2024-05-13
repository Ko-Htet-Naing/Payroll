const haversine = require("haversine");
const moment = require("moment");
const { format } = require("date-fns");
const { Attendance } = require("../models");

let locationRange = 1000;
let isValid = null;

// Set Range by HR
const setlocationAuth = (req, res) => {
  const range = req.body;
  if (!range) return res.sendStatus(404);
  locationRange = range;
};

// Location Auth
const locationAuth = (req, res) => {
  const { lat, lon } = req.body;
  if (!lat && !lon) return res.status(404).send("Lat or Lon Missing");
  const start = {
    latitude: lat || 16.81709781404742,
    longitude: lon || 96.12951985255191,
  };

  const end = {
    latitude: 16.81669722489963,
    longitude: 96.12860150837099,
  };

  isValid = haversine(start, end, {
    threshold: locationRange,
    unit: "meter",
  });
  res.status(200).json({ isValid: isValid });
};

// Get authenticate date and time
const getAuthenticateDateAndTime = async (req, res) => {
  // initiazlize var for hour and minute
  let hour = null;
  let minute = null;
  const { dateTime, userId } = req.body;
  if (!dateTime || !userId)
    return res
      .status(404)
      .send(
        "Date Time Missing or Uncorrect Spelling \n Give parameter name as => 'dateTime' and 'userId' "
      );

  // check AMPM with function
  const checkAMPM = (dateTimeString) => {
    const dateObj = format(dateTimeString, "yyyy-MM-dd HH:mm:ss");

    // hour = momentObj.hour();
    // minute = momentObj.minutes();
    // if (hour < 12) {
    //   return "AM";
    // } else {
    //   return "PM";
    // }
    return dateObj;
  };
  const generateCurrentTime = () => {
    const currentDate = new Date();
    const formattedDate = format(currentDate, "yyyy-MM-dd HH:mm:ss");
    return formattedDate;
  };
  // const userArrivalDate = dateTime.split(" ")[0];
  // const userArrivalTime = dateTime.split(" ")[1];

  console.log(checkAMPM(dateTime));
  console.log(generateCurrentTime());
  // const checkTimeStatus = checkAMPM(dateTime); // check for AM and PM
  // if (checkTimeStatus === "AM") {
  // if (hour <= 8 && minute <= 45) {
  //   await Attendance.create({
  //     in_time: userArrivalTime,
  //     date: userArrivalDate,
  //     UserId: userId,
  //   });
  //   res.status(200).send({ success: true });
  // }
  // } else if (checkTimeStatus === "PM") {
  //   if (hour >= 16 && minute >= 45) {
  //     const findUserInDb = await Attendance.findOne({
  //       where: { userId: userId },
  //     });
  //     if (findUserInDb == null) {
  //       return res
  //         .status(404)
  //         .send(
  //           "Your record doesn't found. မနက်က checkin လုပ်ဖို့ မေ့သွားတာနေမယ်."
  //         );
  //     }
  //     else {

  //       await Attendance.update(
  //         {
  //           out_time: userArrivalTime,
  //         },
  //         {
  //           where: {
  //             UserId: userId,
  //           },
  //         }
  //       );
  //       res.status(200).send({ success: true });
  //     }
  // }
  // }
};
module.exports = {
  locationAuth,
  setlocationAuth,
  getAuthenticateDateAndTime,
};
