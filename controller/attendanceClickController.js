const moment = require("moment");
const { format, isSameDay } = require("date-fns");
const { Attendance, LeaveRecord } = require("../models");
const leaveHelper = require("../helpers/createNewLeaveHelper");
const AttendanceClickHelper = require("../helpers/AttendanceClickHelper");

// Main function to handle real-time click
const realTimeClick = async (req, res) => {
  const { dateTime, checkingStatus, userId } = req.body;
  if (!dateTime || !checkingStatus || !userId) {
    return res.status(404).send("Date Time, Status or User ID is missing.");
  }

  const userArrivalDate = format(dateTime.split(" ")[0], "yyyy-MM-dd");
  const userArrivalTime = dateTime.split(" ")[1];

  // const existingLeaveRecords = await LeaveRecord.findAll({
  //   where: { UserId: userId },
  // });
  // console.log("leaveRecord", existingLeaveRecords);
  // for (let record of existingLeaveRecords) {
  //   const existingLeaveDates = leaveHelper.getDatesInRange(
  //     record.from,
  //     record.to
  //   );

  //   console.log("existing leave date", existingLeaveDates);

  //   if (existingLeaveDates.includes(userArrivalDate)) {
  //     return res
  //       .status(400)
  //       .json({ meassage: "Already record in Leave Record" });
  //   }
  // }

  if (!isSameDay(format(new Date(), "yyyy-MM-dd"), userArrivalDate)) {
    return res.status(404).send("Mismatched date.");
  }

  // လက်ရှိ user input time ကို moment object ပြောင်း
  const currentTime = moment(dateTime, "YYYY-MM-DD HH:mm:ss");
  // လက်ရှိ date ကို only ရယူ
  const currentDate = moment().format("YYYY-MM-DD");
  // ပုံမှန် ရုံးတက်ချိန်ကို သတ်မှတ်
  const standardInTime = moment(`${currentDate} 08:30`, "YYYY-MM-DD HH:mm:ss");
  // Morning Leave ရှိတဲ့ ဆရာကြီး ဆရာမကြီး များအတွက်
  const lateThresholdTime = moment(
    `${currentDate} 12:30`,
    "YYYY-MM-DD HH:mm:ss"
  );
  // ပုံမှန် ရုံးဆင်းချိန်ကို သတ်မှတ်
  const eveningEndTime = moment(`${currentDate} 16:30`, "YYYY-MM-DD HH:mm:ss"); // Assuming 5 PM as the end of the evening period

  let payload = {
    in_time: null,
    late_in_time: null,
    early_out_time: null,
    out_time: null,
  };
  // User in / out time ပေါ်မူတည်ပြီး ဆွဲထုတ်ရန်
  let clickOption = null;
  // Check In ကို process လုပ်ပေးရန်
  if (checkingStatus === "in") {
    clickOption = "in_time";
    // 8 ခွဲ နှင့် 8 ခွဲအောက် ဝင်လာသူများအတွက်
    if (
      currentTime.isBefore(standardInTime) ||
      currentTime.isSame(standardInTime)
    ) {
      payload = {
        ...payload,
        in_time: userArrivalTime,
        late_in_time: 0,
      };
    }
    // 8 ခွဲ အထက်နှင့် 12 ခွဲအကြားဝင်လာသူများအတွက်
    if (
      currentTime.isAfter(standardInTime) &&
      currentTime.isBefore(lateThresholdTime)
    ) {
      const hasMorningLeave =
        await AttendanceClickHelper.checkUserMorningEveningLeave(
          userId,
          userArrivalDate,
          "Morning Leave"
        );
      console.log("has morning leave ? : ", hasMorningLeave);
      if (!hasMorningLeave) {
        console.log("I am in section !hasMoningLeave");
        payload = {
          ...payload,
          in_time: userArrivalTime,
          late_in_time: currentTime.diff(standardInTime, "minutes"), // Count as late minutes if no morning leave
        };
      } else {
        console.log("I am also in this case");
        payload = {
          ...payload,
          in_time: userArrivalTime,
          late_in_time: 0, // Reset late time as they have an approved morning leave
        };
      }
    }
    // ၁၂ ခွဲ နှင့် ၁၂ ခွဲ အထက် ဝင်လာသူများအတွက်
    if (
      currentTime.isAfter(lateThresholdTime) ||
      currentTime.isSame(lateThresholdTime)
    ) {
      const hasMorningLeave =
        await AttendanceClickHelper.checkUserMorningEveningLeave(
          userId,
          userArrivalDate,
          "Morning Leave"
        );
      // Morning Leave မရှိ အချိန်ကလည်း 12 ခွဲထက်ကော်သွားရင်
      if (!hasMorningLeave) {
        payload = {
          ...payload,
          in_time: userArrivalTime,
          late_in_time: currentTime.diff(standardInTime, "minutes"),
        };
      } else {
        console.log("I have morning leave but I over 12 : 30 pm ");
        // Morning Leave တော့ရှိ အချိန်ကတော့ ၁၂ ထက်ကျော်သွားရင်
        payload = {
          ...payload,
          in_time: userArrivalTime,
          late_in_time: currentTime.diff(lateThresholdTime, "minutes"),
        };
      }
    }
  }
  if (checkingStatus === "out") {
    clickOption = "out_time";
    // 12ခွဲ နှင့် 12ခွဲ အောက် မှာ check out လာနှိပ်ရင်
    if (currentTime.isBefore(lateThresholdTime)) {
      const hasEveningLeave =
        await AttendanceClickHelper.checkUserMorningEveningLeave(
          userId,
          userArrivalDate,
          "Evening Leave"
        );
      if (!hasEveningLeave) {
        payload = {
          ...payload,
          out_time: userArrivalTime,
          early_out_time: Math.abs(currentTime.diff(eveningEndTime, "minutes")),
        };
      } else {
        payload = {
          ...payload,
          out_time: userArrivalTime,
          early_out_time: Math.abs(
            currentTime.diff(lateThresholdTime, "minutes")
          ),
        };
      }
    }
    // 12 ခွဲအတိမှာ ထွက်ရင်
    if (currentTime.isSame(lateThresholdTime)) {
      const hasEveningLeave =
        await AttendanceClickHelper.checkUserMorningEveningLeave(
          userId,
          userArrivalDate,
          "Evening Leave"
        );
      if (!hasEveningLeave) {
        payload = {
          ...payload,
          out_time: userArrivalTime,
          early_out_time: Math.abs(currentTime.diff(eveningEndTime, "minutes")),
        };
      } else {
        payload = {
          ...payload,
          out_time: userArrivalTime,
          early_out_time: 0,
        };
      }
    }
    // 12ခွဲ အထက် 4ခွဲ အောက်မှာ check out လာနှိပ်ရင်
    if (
      currentTime.isAfter(lateThresholdTime) &&
      currentTime.isBefore(eveningEndTime)
    ) {
      const hasEveningLeave =
        await AttendanceClickHelper.checkUserMorningEveningLeave(
          userId,
          userArrivalDate,
          "Evening Leave"
        );
      if (hasEveningLeave) {
        payload = {
          ...payload,
          out_time: userArrivalTime,
          early_out_time: 0,
        };
      } else {
        payload = {
          ...payload,
          out_time: userArrivalTime,
          early_out_time: Math.abs(currentTime.diff(eveningEndTime, "minutes")),
        };
      }
    }
    // 4ခွဲ အတိ နှင့် 4ခွဲ နောက်ပိုင်းမှာ check out လာနှိပ်ရင်
    if (
      currentTime.isAfter(eveningEndTime) ||
      currentTime.isSame(eveningEndTime)
    ) {
      payload = {
        ...payload,
        out_time: userArrivalTime,
        early_out_time: 0,
      };
    }
  }

  const isUserAlradyCheck = await AttendanceClickHelper.getUserClick(
    userId,
    dateTime
  );
  if (isUserAlradyCheck) {
    if (clickOption === "in_time" && isUserAlradyCheck.in_time) {
      return res
        .status(403)
        .json({ message: "You have already checked in this morning." });
    }
    if (clickOption === "out_time" && isUserAlradyCheck.out_time) {
      return res
        .status(403)
        .json({ message: "You have already checked out this evening." });
    }
  }

  if (!isUserAlradyCheck?.in_time && !isUserAlradyCheck?.out_time) {
    await Attendance.create({
      in_time: payload.in_time,
      out_time: payload.out_time,
      late_in_time: payload.late_in_time,
      early_out_time: payload.early_out_time,
      UserId: userId,
      date: dateTime,
    });
  }
  if (isUserAlradyCheck?.out_time === null) {
    await Attendance.update(
      {
        out_time: payload.out_time,
        early_out_time: payload.early_out_time,
      },
      {
        where: {
          userId: userId,
          date: dateTime,
        },
      }
    );
  }
  if (isUserAlradyCheck?.in_time === null) {
    await Attendance.update(
      {
        in_time: payload.in_time,
        late_in_time: payload.late_in_time,
      },
      {
        where: {
          userId: userId,
          date: dateTime,
        },
      }
    );
  }

  return res.status(200).send({ success: true });
};
module.exports = {
  realTimeClick,
};
