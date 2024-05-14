const haversine = require("haversine");
const moment = require("moment");
const { format, isSameDay, parse, differenceInSeconds } = require("date-fns");
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
  let second = null;
  let userArrivalDate = null;
  let userArrivalTime = null;
  const { dateTime, userId } = req.body;
  if (!dateTime || !userId)
    return res
      .status(404)
      .send(
        "Date Time Missing or Uncorrect Spelling \n Give parameter name as => 'dateTime' and 'userId' "
      );

  userArrivalDate = dateTime.split(" ")[0]
    ? format(dateTime.split(" ")[0], "yyyy-MM-dd")
    : null;
  userArrivalTime = dateTime.split(" ")[1] ? dateTime.split(" ")[1] : null;

  // Extract Hour Minute and Seconds
  const parseTime = parse(userArrivalTime, "HH:mm:ss", new Date());

  hour = parseTime.getHours();
  minute = parseTime.getMinutes();
  second = parseTime.getSeconds();
  // let currentTime =

  const getPredefinedDateAndTime = (chooseDayTime) => {
    const date2 = moment();
    const dateString = date2.format("YYYY-MM-DD");
    const currentDate = dateString.split(" ")[0];
    if (chooseDayTime === "AM") {
      const customTime = "08:30:00";
      return (myCustomDate = moment(`${currentDate}T${customTime}`));
    }
    if (chooseDayTime === "PM") {
      const customTime = "16:30:00";
      return (myCustomDate = moment(`${currentDate}T${customTime}`));
    }
  };

  if (
    isSameDay(format(new Date(), "yyyy-MM-dd"), format(dateTime, "yyyy-MM-dd"))
  ) {
    const checkMorningEveningStatus = format(new Date(dateTime), "a");

    if (checkMorningEveningStatus === "AM") {
      if (hour <= 8 && minute <= 30) {
        // အချိန်မှီရောက်လာရင်
        await Attendance.create({
          in_time: userArrivalTime,
          date: userArrivalDate,
          UserId: userId,
        });
        return res.status(200).send({ success: true });
      }
      if (hour >= 8 && minute > 30) {
        // Leave ရှိလား မရှိဘူးလား

        // နောက်ကျမှ ဝင်လာခဲ့ရင်
        const currentDate = getPredefinedDateAndTime("AM");
        const earlyOutMinutes = moment(dateTime).diff(currentDate, "minutes");
        await Attendance.create({
          in_time: userArrivalTime,
          late_in_time: earlyOutMinutes,
          date: userArrivalDate,
          UserId: userId,
        });

        return res.status(200).send({ success: true });
      }
    } else if (checkMorningEveningStatus === "PM") {
      // user ကို အရင် ရှာ
      const findUserInDb = await Attendance.findOne({
        where: { userId: userId },
      });
      if (findUserInDb == null) {
        return res
          .status(404)
          .send(
            "Your record doesn't found. မနက်က checkin လုပ်ဖို့ မေ့သွားတာနေမယ်. request ပြန်တင်ပါ..."
          );
      }
      if (hour >= 16 && minute >= 30) {
        // user ကို လည်း ရှာတွေ့ပြီး
        // ပုံမှန်အချိန်ထွက်ရင်
        await Attendance.update(
          {
            out_time: userArrivalTime,
          },
          {
            where: {
              UserId: userId,
            },
          }
        );
      } else {
        // နဲနဲစောထွက်ရင်
        const currentDate = getPredefinedDateAndTime("PM");

        const earlyOutMinutes = moment(currentDate).diff(dateTime, "minutes");
        await Attendance.create({
          in_time: userArrivalTime,
          late_in_time: earlyOutMinutes,
          date: userArrivalDate,
          UserId: userId,
        });

        return res.status(200).send({ success: true });
      }
    }
  }
};
module.exports = {
  locationAuth,
  setlocationAuth,
  getAuthenticateDateAndTime,
};
