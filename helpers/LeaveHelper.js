const { Users, Attendance, Attendance_Record } = require("../models");
const moment = require("moment");

class LeaveHelper {
  /**
   * Check Date is Valid
   * @returns {object} - Returns object that contain { status and message }
   * @throws {Error} - Throw an error when occur
   */

  // လက်ရှိနေ့စွဲကနေ နောက်သုံးရက် ဟုတ်မဟုတ်ကို စစ်တဲ့ function
  static checkAnnualLeaveIsAfterThreeDayFromNow(from, to) {
    const today = moment().format("YYYY-MM-DD");
    const threeDaysFromToday = moment(today).add(3, "d");
    const formattedDateAfterThreeDay =
      moment(threeDaysFromToday).format("YYYY-MM-DD");
    const checkFromValue = moment(formattedDateAfterThreeDay).isSame(from);
    if (checkFromValue) return { success: true };
    else return { success: false };
  }

  static checkValidyOfDate(from, to) {
    const today = moment().format("YYYY-MM-DD");
    const fromDateCheck = moment(today).isBefore(from);
    const toDateCheck = moment(today).isBefore(to);
    return { fromDateCheck, toDateCheck };
  }

  static checkFromToDate(from, to, leaveType = null) {
    const { fromDateCheck, toDateCheck } = this.checkValidyOfDate(from, to);
    if (!fromDateCheck && !toDateCheck) {
      // Date ကို ဟိုးအရင် ရက်တွေ မဟုတ်ရဘူးလို့ အရင်စစ်တယ်
      if (leaveType === "Annual Leave") {
        // Annual Leave ဆိုရင် သုံးရက် ကြိုယူထားလားစစ်
        const result = checkAnnualLeaveIsAfterThreeDayFromNow(from, to);
        if (result.success) {
          return { success: true };
        } else {
          return {
            success: false,
            message: "ကပ်ယူလို့ မရပါဘူး လက်ရှိ နေ့စွဲကနေ ၃ ရက်ကြိုယူပါ...",
          };
        }
      } else {
        return { success: true };
      }
    } else {
      return {
        success: false,
        message:
          "ကျန်ခဲ့တဲ့ date တွေကို ခွင့်ယူလို့ မရဘူး... \n အတိတ်ကခင်ဗျားကို ပစ်သွားတဲ့ သူမလိုပေါ့...",
      };
    }
  }
}
module.exports = LeaveHelper;
