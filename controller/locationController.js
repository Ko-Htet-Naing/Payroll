const haversine = require("haversine");
const moment = require("moment");
const { format, isSameDay, parse, differenceInSeconds } = require("date-fns");
const { Attendance } = require("../models");

let locationRange = 1000;
let isValid = null;

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
// Set Range by HR
const setlocationAuth = (req, res) => {
  const range = req.body;
  if (!range) return res.sendStatus(404);
  locationRange = range;
};

// Get authenticate date and time
const getAuthenticateDateAndTime = async (req, res) => {
  // Predefined Date And Time Function
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
  // User DB ထဲမှာ ရှိမရှိ စစ်တဲ့ function
  const checkUserAlreadyExistsInDB = async (userId, currentDate) => {
    const userExists = await Attendance.findOne({
      where: { UserId: userId, date: currentDate },
    });
    return userExists ? true : false;
  };
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
  const currentDate = userArrivalDate;
  // Extract Hour Minute and Seconds
  const parseTime = parse(userArrivalTime, "HH:mm:ss", new Date());
  hour = parseTime.getHours();
  minute = parseTime.getMinutes();
  second = parseTime.getSeconds();
  console.log(`Current Hour is ${hour} and Current Minutes is ${minute}`);

  // Leave Table မှာ User id နဲ့ ပတ်သတ်ပြီး leave ရှိမရှိ စစ် ရှိခဲ့ရင် status approved ကို စစ်
  // Approved သာ ဖြစ်ခဲ့ရင် အချိန်ချိန်း Leave Type ပေါ်လည်း မူတည်
  // Morning Leave သာဖြစ်ခဲ့ရင် အလုပ်ချိန် 12:30 to 4:30
  // Evening Leave သာဖြစ်ခဲ့ရင် အလုပ်ချိန် 8:30 to 12:30

  const checkUserDateExistStatus = async (optionForDayNight) => {
    // User ရဲ့ in_time ကို မနက်ခင်းမှာ စစ်
    // false ဆိုတာ User ကို ပေးလုပ်တာ ဖြစ်ပြီး
    // true ဆိုတာ User ကို တားမြစ်တာ ဖြစ်ပါတယ်...
    if (optionForDayNight === "AM") {
      const userDayCheckIn = await Attendance.findOne({
        where: { UserId: userId },
        attributes: ["in_time", "date"],
      });
      if (userDayCheckIn === null) {
        return false;
      }
      if (userDayCheckIn.date !== currentDate) {
        // current date နဲ့ မညီရင်
        let occurance = await Attendance.findOne({
          where: { date: currentDate, UserId: userId },
          attributes: ["in_time"],
        });
        if (occurance === null) {
          // in_time ကို စစ် null ဖြစ်နေရင် false
          return false;
        } else if (occurance !== null) {
          // in_time null မဖြစ်ရင် သူ check_in လုပ်ပြီးပြီဆိုတဲ့သဘော
          return true;
        }
        return false;
      } else if (userDayCheckIn.date === currentDate) {
        return true;
      }
    }
    // User ရဲ့ out_time ကို ညနေခင်းမှာ စစ်
    if (optionForDayNight === "PM") {
      const userNightCheckIn = await Attendance.findOne({
        where: { UserId: userId },
        attributes: ["out_time", "date"],
      });
      if (userNightCheckIn === null) {
        return false;
      }
      if (userNightCheckIn.date !== currentDate) {
        // current date နဲ့ မညီရင်
        let occurance = await Attendance.findOne({
          where: { date: currentDate, UserId: userId },
          attributes: ["out_time"],
        });
        if (occurance.out_time === null) {
          // in_time ကို စစ် null ဖြစ်နေရင် false
          return false;
        } else if (occurance.out_time !== null) {
          // in_time null မဖြစ်ရင် သူ check_in လုပ်ပြီးပြီဆိုတဲ့သဘော
          return true;
        }
        return false;
      } else if (userNightCheckIn.date === currentDate) {
        return true;
      }
    }
  };

  if (
    isSameDay(format(new Date(), "yyyy-MM-dd"), format(dateTime, "yyyy-MM-dd"))
  ) {
    const checkMorningEveningStatus = format(new Date(dateTime), "a");

    if (checkMorningEveningStatus === "AM") {
      if (hour <= 8 && minute <= 30) {
        // အချိန်မှီရောက်လာရင်
        if (await checkUserAlreadyExistsInDB(userId, currentDate)) {
          await Attendance.update(
            {
              in_time: userArrivalTime,
            },
            { where: { UserId: userId, date: currentDate } }
          );
          return res.status(200).send({ success: true });
        } else {
          if (await checkUserDateExistStatus("AM"))
            return res.status(401).send("You already check in for morning");
          await Attendance.create({
            in_time: userArrivalTime,
            date: userArrivalDate,
            UserId: userId,
          });
          return res.status(200).send({ success: true });
        }
      }
      if (hour >= 8 || minute > 30) {
        // Leave ရှိလား မရှိဘူးလား
        // နောက်ကျမှ ဝင်လာခဲ့ရင်
        if (await checkUserDateExistStatus("AM"))
          return res.status(401).send("You already check in for morning");
        const currentDate = getPredefinedDateAndTime("AM");
        const lateInTime = moment(dateTime).diff(currentDate, "minutes");

        // record ရှိမရှိ အရင် စစ်မယ် မရှိမှ create လုပ်မယ် ရှိရင် update လုပ်မယ်...
        if (await checkUserAlreadyExistsInDB(userId, currentDate)) {
          await Attendance.update(
            {
              in_time: userArrivalTime,
            },
            { where: { UserId: userId, date: currentDate } }
          );
          return res.status(200).send({ success: true });
        } else {
          // record လုံးဝ အသစ်ဆိုရင်
          await Attendance.create({
            in_time: userArrivalTime,
            late_in_time: lateInTime,
            date: userArrivalDate,
            UserId: userId,
          });
          return res.status(200).send({ success: true });
        }
      }
    } else if (checkMorningEveningStatus === "PM") {
      const currentDate = getPredefinedDateAndTime("AM");
      // user ကို အရင် ရှာ
      if ((await checkUserAlreadyExistsInDB(userId, currentDate)) == false) {
        return res
          .status(404)
          .send(
            "Your record doesn't found. မနက်က checkin လုပ်ဖို့ မေ့သွားတာနေမယ်. request ပြန်တင်ပါ..."
          );
      }
      if (hour >= 16 && minute >= 30) {
        // user ကို လည်း ရှာတွေ့ပြီး
        // ပုံမှန်အချိန်ထွက်ရင်
        if (await checkUserDateExistStatus("PM"))
          return res.status(401).send("You already check out for evening");
        await Attendance.update(
          {
            out_time: userArrivalTime,
          },
          {
            where: {
              UserId: userId,
              date: currentDate,
            },
          }
        );
        return res.status(200).send({ success: true });
      } else {
        // User ကိုရှာတွေ့ပြီး
        // နဲနဲစောထွက်ရင်
        if (await checkUserDateExistStatus("PM"))
          return res.status(401).send("You already check out for evening");

        const currentDate = getPredefinedDateAndTime("PM");
        const earlyOutTime = moment(currentDate).diff(dateTime, "minutes");
        await Attendance.update(
          {
            out_time: userArrivalTime,
            early_out_time: earlyOutTime,
          },
          { where: { UserId: userId, date: currentDate } }
        );

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
