const moment = require("moment");
const { format, isSameDay, parse } = require("date-fns");
const { Attendance } = require("../models");

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
  console.log(`Current Hour is ${hour} and Current Minutes is ${minute}`);

  // Leave Table မှာ User id နဲ့ ပတ်သတ်ပြီး leave ရှိမရှိ စစ် ရှိခဲ့ရင် status approved ကို စစ်
  // Approved သာ ဖြစ်ခဲ့ရင် အချိန်ချိန်း Leave Type ပေါ်လည်း မူတည်
  // Morning Leave သာဖြစ်ခဲ့ရင် အလုပ်ချိန် 12:30 to 4:30
  // Evening Leave သာဖြစ်ခဲ့ရင် အလုပ်ချိန် 8:30 to 12:30
  const checkUserDateExistStatus = async (optionForDayNight) => {
    // User ရဲ့ in_time ကို မနက်ခင်းမှာ စစ်
    if (optionForDayNight === "AM") {
      const userDayCheckIn = await Attendance.findOne({
        where: { UserId: userId },
        attributes: ["in_time"],
      });
      if (userDayCheckIn === null) {
        return false;
      }
      if (userDayCheckIn.in_time === null) {
        return false;
      } else {
        return true;
      }
    }
    // User ရဲ့ out_time ကို ညနေခင်းမှာ စစ်
    if (optionForDayNight === "PM") {
      const userNightCheckIn = await Attendance.findOne({
        where: { UserId: userId },
        attributes: ["out_time"],
      });
      if (userNightCheckIn === null) {
        return false;
      }
      if (userNightCheckIn.out_time === null) {
        return false;
      } else {
        return true;
      }
    }
  };

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
        if (await checkUserDateExistStatus("AM"))
          return res.status(401).send("You already check in for morning");
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
        if (await checkUserDateExistStatus("AM"))
          return res.status(401).send("You already check in for morning");
        const currentDate = getPredefinedDateAndTime("AM");
        const lateInTime = moment(dateTime).diff(currentDate, "minutes");
        await Attendance.create({
          in_time: userArrivalTime,
          late_in_time: lateInTime,
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
        if (await checkUserDateExistStatus("PM"))
          return res.status(401).send("You already check out for evening");
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
          { where: { UserId: userId } }
        );

        return res.status(200).send({ success: true });
      }
    }
  }
};
