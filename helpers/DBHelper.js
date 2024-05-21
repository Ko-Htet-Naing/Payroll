const { Users, Attendance, Attendance_Record } = require("../models");
const { Op } = require("sequelize");

class UserHelper {
  /**
   * Check if a user exists in database
   *
   * @param {string} userId - The ID of the user to check.
   * @returns {Promise<boolean>} - Returns true if the user exists, otherwise false.
   * @throws {Error} - Throws an error if the database query fails.
   */

  // Check User Exist in database
  static async checkUserInDB(userId) {
    try {
      const user = await Users.findByPk(userId);
      return !!user; // return true if user exists, otherwise false
    } catch (error) {
      console.log("Error while finding user in database", error);
      throw new Error("Database query failed");
    }
  }

  // Check User Exists in Attendance Table
  static async checkUserInAttendanceDB(userId) {
    try {
      console.log("I am in checking");
      const user = await Attendance.findOne({ where: { UserId: userId } });
      console.log(!!user);
      return !!user; // return true if user exists, otherwise false
    } catch (error) {
      console.log("Error while finding attendance in database", error);
      throw new Error("Attendance Database query failed");
    }
  }

  // Check User In Attendance Database and Replace with predefined value
  static async findAndReplace(userId, option, userDate) {
    const userOperation =
      option === "in_time_late" ? "AM" : "out_time_late" ? "PM" : null;
    if (userOperation === "AM") {
      try {
        const isInTimeNull = await Attendance.findOne({
          attributes: ["in_time"],
          where: {
            UserId: userId,
            date: userDate,
          },
        });
        console.log(isInTimeNull);
        if (isInTimeNull?.in_time === null) {
          try {
            const result = await Attendance.update(
              {
                in_time: "8:30",
              },
              {
                where: {
                  UserId: userId,
                  date: userDate,
                },
              }
            );
            if (result[0] > 0) {
              await Users.decrement("AttendanceLeave", {
                by: 1,
                where: {
                  id: userId,
                },
              });
            } else {
              // Handle the case where no rows were updated
              console.log(
                "No attendance record found for the specified user and date."
              );
            }
          } catch (error) {
            console.log(
              "Error while updating morning user data in attendance table",
              error
            );
            throw new Error("Error while updating user");
          }
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log("Error while updating attendance in database", error);
        throw new Error("Attendance Database query failed");
      }
      // return !!user; // return true if user exists, otherwise false
    } else if (userOperation === "PM") {
      try {
        const isOutTimeNull = await Attendance.findOne({
          attributes: ["out_time"],
          where: {
            UserId: userId,
            date: userDate,
          },
        });
        if (isOutTimeNull?.out_time === null) {
          try {
            const result = await Attendance.update(
              { out_time: "16:30" },
              {
                where: {
                  UserId: userId,
                  date: userDate,
                },
              }
            );
            if (result[0] > 0) {
              // Check User Count before updating (avoiding error)
              const checkUserCount = await Users.findOne({
                attributes: ["AttendanceLeave"],
                where: {
                  id: userId,
                },
              });
              if (checkUserCount.AttendanceLeave !== 0) {
                await Users.decrement("AttendanceLeave", {
                  by: 1,
                  where: {
                    id: userId,
                  },
                });
              }
            } else {
              return false;
            }
          } catch (error) {
            console.log(
              "Error while updating evening user data in attendance table",
              error
            );
            throw new Error("Error while updating user");
          }
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log("Error while updating attendance in database", error);
        throw new Error("Attendance Database query failed");
      }
    }
  }

  // Check User Attendance Leave count on Users Table
  static async findUserAttendanceLeaveCount(userId) {
    try {
      const { AttendanceLeave } = await Users.findOne({
        attributes: ["AttendanceLeave"],
        where: {
          id: userId,
        },
      });
      if (parseInt(AttendanceLeave) === 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log("Error while finding attendance leave count", error);
      throw new Error("Error while finding attendance leave count");
    }
  }

  // change status pending to approved in Database
  static async findUserAndChangeStateToApproved(userId) {
    try {
      // Do some database query
    } catch (error) {
      console.log(
        "Error while changing pending to approved in Database",
        error
      );
      throw new Error("Error while changing pending to approved in Database");
    }
  }

  // Current user ဟာ Approved ဟုတ်မဟုတ်စစ်ဆေး
  // Approved ဆိုရင် true ပြန်
  // Pending ဆိုရင် false ပြန်
  static async checkUserAlreadyApproved(userId, date) {
    // Attendance Records ထဲမှာ Pending state နဲ့ Approved State တွေကို ရှာမယ်
    console.log("I am in checkUserAlreadyApproved function");
    try {
      const result = await Attendance_Record.findOne({
        where: {
          UserId: userId,
          date: date,
          status: { [Op.in]: ["Pending", "Approved"] },
        },
      });
      if (result) {
        if (result.status === "Approved") {
          // Approved ဖြစ်ပြီးသားဆိုရင် false ဆိုတာ အလုပ်ပေးမလုပ်တဲ့ သဘော
          // Approved ဖြစ်နေပြီးသားဆိုတာ User ကို အကြောင်းပြန်ပေးမယ်
          return false;
        } else {
          // Pending ဆိုမှ true ပြန်ပြီး အလုပ်ပေးလုပ်မယ်ဆိုတဲ့ သဘော
          return true;
        }
      } else {
        return "User Not exists in Attendance_Records Table";
      }
    } catch (error) {
      console.log("Error while fetching data from database", error);
    }
  }
  // User ရဲ့ status (  Pending to Approved ) ကို database ထဲမှာ ပြုပြင်တဲ့ function
  static async updateUserStatusInDB(UserId, date) {
    await Attendance_Record.update(
      { status: "Approved" },
      {
        where: {
          UserId: UserId,
          date: date,
        },
      }
    );
  }
  // User ရဲ့ status (  Pending to Rejected ) ကို database ထဲမှာ ပြုပြင်တဲ့ function
  static async setUserAttendanceToRejected(UserId, date) {
    console.log(
      "Here is return of checkUser",
      await UserHelper.checkUserAlreadyApproved(UserId, date)
    );
  }
}

module.exports = UserHelper;
