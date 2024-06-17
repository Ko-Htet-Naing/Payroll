const { Users, Attendance, Department } = require("../models");
const { Op } = require("sequelize");

async function getTotalAttendanceCount() {
  const totalCount = await Attendance.count({
    where: { UserId: { [Op.not]: null } },
  });
  return totalCount;
}

async function getTotalAttendacneCountByUserId(userId) {
  const totalCount = await Attendance.count({ where: { UserId: userId } });
  return totalCount;
}

async function getAttendanceList({
  page,
  size = 10,
  username,
  userId,
  fromDate,
  toDate,
  position,
  department,
  employeeId,
}) {
  try {
    const whereClause = {
      ...(fromDate &&
        toDate && {
          date: { [Op.between]: [fromDate, toDate] },
        }),
      ...(userId && { UserId: userId }),
    };

    const whereUser = {
      ...(username && { username: { [Op.like]: `%${username}%` } }),
      ...(position && { Position: position }),
      ...(employeeId && { EmployeeId: { [Op.like]: `%${employeeId}%` } }),
    };

    const userInclude = {
      where: whereUser,
      model: Users,
      attributes: ["username", "EmployeeId", "Position"],
      include: [
        {
          model: Department,
          attributes: ["deptName"],
          ...(department && { where: { deptName: department } }),
        },
      ],
    };

    const order = [["date", "DESC"]];
    const attendanceList = await Attendance.findAll({
      where: whereClause,
      include: [userInclude],
      order: order,
      limit: size,
      offset: page * size,
    });

    return attendanceList;
  } catch (error) {
    console.error("Error fetching attendancce records:", error);
    throw error;
  }
}

// class LeaveHelper {
//   /**
//    * Check Date is Valid
//    * @returns {object} - Returns object that contain { status and message }
//    * @throws {Error} - Throw an error when occur
//    */

//   // လက်ရှိနေ့စွဲကနေ နောက်သုံးရက် ဟုတ်မဟုတ်ကို စစ်တဲ့ function
//   static checkAnnualLeaveIsAfterThreeDayFromNow(from, to) {
//     const today = moment().format("YYYY-MM-DD");
//     const threeDaysFromToday = moment(today).add(3, "d");
//     const formattedDateAfterThreeDay =
//       moment(threeDaysFromToday).format("YYYY-MM-DD");
//     const checkFromValue = moment(formattedDateAfterThreeDay).isSame(from);
//     if (checkFromValue) return { success: true };
//     else return { success: false };
//   }

//   static checkValidyOfDate(from,to){
//     const today = moment().format("YYYY-MM-DD");
//     const fromDateCheck = moment(today).isBefore(from);
//     const toDateCheck = moment(today).isBefore(to);
//     return { fromDateCheck, toDateCheck }
//   }

//   static checkFromToDate(from, to, leaveType = null) {
//     const { fromDateCheck, toDateCheck } = this.checkValidyOfDate(from,to);
//     if (!fromDateCheck && !toDateCheck) {
//       // Date ကို ဟိုးအရင် ရက်တွေ မဟုတ်ရဘူးလို့ အရင်စစ်တယ်
//       if (leaveType === "Annual Leave") {
//         // Annual Leave ဆိုရင် သုံးရက် ကြိုယူထားလားစစ်
//         const result = checkAnnualLeaveIsAfterThreeDayFromNow(from, to);
//         if (result.success) {
//           return { success: true };
//         } else {
//           return {
//             success: false,
//             message: "ကပ်ယူလို့ မရပါဘူး လက်ရှိ နေ့စွဲကနေ ၃ ရက်ကြိုယူပါ...",
//           };
//         }
//       } else {
//         return { success: true };
//       }
//     } else {
//       return {
//         success: false,
//         message:
//           "ကျန်ခဲ့တဲ့ date တွေကို ခွင့်ယူလို့ မရဘူး... \n အတိတ်ကခင်ဗျားကို ပစ်သွားတဲ့ သူမလိုပေါ့...",
//       };
//     }
//   }
// }
module.exports = {
  getAttendanceList,
  getTotalAttendanceCount,
  getTotalAttendacneCountByUserId,
};
