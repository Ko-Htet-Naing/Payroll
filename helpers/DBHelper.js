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

  // static Get Username from database
  static async getUsernameFromDB(userId) {
    try {
      const user = await Users.findOne({
        where: {
          id: userId,
        },
        attributes: ["Username"],
        raw: true,
      });
      // To handle Possible Error
      return user?.Username ?? "Visited User";
    } catch (error) {
      throw new Error(error);
    }
  }

  // Check User Exists in Attendance Table
  static async checkUserInAttendanceDB(userId) {
    try {
      const user = await Attendance.findOne({ where: { UserId: userId } });
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
        console.log("checking no exists user ", isInTimeNull);
        // (UserId, date) သုံးပြီး တိုက်စစ်လို့ သူ့ လက်ရှိ data တွေနဲ့ တယောက်နဲ့ မှ မကိုက်ညီရင်
        if (isInTimeNull === null) {
          return {
            success: false,
            message: "No User Find With This Information...",
          };
        }
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
              return {
                success: true,
                message: "Successfully Updated Your Information",
              };
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
          return {
            success: false,
            message:
              "အဲ့နေ့ မနက်ပိုင်းက လက်ရှိ id နဲ့ သက်ဆိုင်တဲ့ cell မှာ null မဖြစ်နေပါဘူး...",
          };
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
        console.log(isOutTimeNull);
        if (isOutTimeNull === null) {
          return {
            success: false,
            message: "No User Find With This Information...",
          };
        }
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
              await Users.decrement("AttendanceLeave", {
                by: 1,
                where: {
                  id: userId,
                },
              });
              return {
                success: true,
                message: "Successfully Updated Your Information",
              };
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
          return {
            success: false,
            message:
              "အဲ့နေ့ ညနေပိုင်းက လက်ရှိ id နဲ့ သက်ဆိုင်တဲ့ cell မှာ null မဖြစ်နေပါဘူး...",
          };
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
        } else if (result.status === "Pending") {
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

  static async createNewAttendanceRequest(objects) {
    try {
      const existingRequest = await Attendance_Record.findOne({
        where: {
          reason: objects.reason,
          date: objects.date,
          UserId: objects.UserId,
        },
      });
      // တိုက်စစ်တုန်း ထပ်နေတဲ့ data ရှိမနေလို့ Null နှင့်စစ်ထားတာ..
      if (existingRequest === null) {
        await Attendance_Record.create({
          reason: objects.reason,
          date: objects.date,
          UserId: objects.UserId,
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error while adding new user : ", error);
      throw new Error(error);
      return [];
    }
  }
}

module.exports = UserHelper;
