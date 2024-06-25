const { isValid } = require("date-fns");
const {
  Users,
  Attendance,
  Attendance_Record,
  Pending_Notification,
} = require("../models");
const { Op } = require("sequelize");

class UserHelper {
  /**
   * Check if a user exists in database
   *
   * @param {string} userId - The ID of the user to check.
   * @returns {Promise<boolean>} - Returns true if the user exists, otherwise false.
   * @throws {Error} - Throws an error if the database query fails.
   */

  // save pending notification in database
  static async sendPendingMessageInDB(userId, title, message) {
    try {
      const result = await Pending_Notification.create({
        UserId: userId,
        title: title,
        message: message,
      });
      return result;
    } catch (error) {
      console.log("Error while adding pending notification to database");
      throw new Error(error.message);
    }
  }

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

  // change user request to rejected
  static async confirmRequest(Id, hrDecision) {
    const result = await Attendance_Record.update(
      { status: hrDecision },
      { where: { id: Id } }
    );
    return !!result;
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
  // Check User data in attendance database
  static async getUserData(Id) {
    try {
      return await Attendance_Record.findOne({
        where: { id: Id },
        attributes: ["date", "reason", "UserId"],
        raw: true,
      });
    } catch (error) {
      console.log("Error while finding attendance in database", error.message);
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
                late_in_time: 0,
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
        if (isOutTimeNull === null) {
          return {
            success: false,
            message: "No User Find With This Information...",
          };
        }
        if (isOutTimeNull?.out_time === null) {
          try {
            const result = await Attendance.update(
              { out_time: "16:30", early_out_time: 0 },
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
  static async checkUserAlreadyApproved(Id, hrDecision) {
    try {
      const result = await Attendance_Record.findOne({
        where: {
          id: Id,
        },
        attributes: ["status"],
        raw: true,
      });
      if (!result) {
        return {
          isSuccess: false,
          message: "User does not exist in Attendance_Records Table",
        };
      }
      if (result.status === hrDecision) {
        return {
          isSuccess: false,
          message: `HR already ${hrDecision} your request.`,
        };
      }
      return { isSuccess: true, message: `Your request are ${hrDecision}...` };
    } catch (error) {
      console.log("Error while fetching data from database", error);
      throw new Error("Database query failed");
    }
  }
  // User ရဲ့ status (  Pending to Approved ) ကို database ထဲမှာ ပြုပြင်တဲ့ function
  static async updateUserStatusInDB(UserId, date, status) {
    await Attendance_Record.update(
      { status: status },
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
    const timeLateSector =
      objects.reason === "in_time_late"
        ? "in_time"
        : objects.reason === "out_time_late"
        ? "out_time"
        : null;

    // in_time & out_time ၂ခုလုံး null မဖြစ်တာသေချာ မှ ကျန်တာ ပေးလုပ်ခြင်း
    // early out လုပ်ပစ်ခြင်း

    try {
      const isValidAttendance = await Attendance.findOne({
        where: {
          UserId: objects.UserId,
          date: objects.date,
        },
        attributes: ["in_time", "out_time"],
        raw: true,
      });
      if (!isValidAttendance) {
        return {
          isSuccess: false,
          message:
            "In_Time Out_Time နှစ်ခုလုံး null ဖြစ်နေပြီး request လာတင်လို့မရဘူးလေကွာ.. မင်းတို့ဆိုသည်မှာလည်း...",
        };
      }
    } catch (error) {
      console.log("error while validating user in_time and out_time");
      throw new Error(error);
    }

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
        // လက်ရှိ date ရဲ့ in_time out_time null ဖြစ်မဖြစ် စစ်ဆေးခြင်း
        const isValidRequest = await Attendance.findOne({
          where: {
            [Op.and]: [{ date: objects.date }, { UserId: objects.UserId }],
          },
          attributes: [timeLateSector],
          raw: true,
        });
        if (isValidRequest?.[timeLateSector] === null) {
          // သူ request လုပ်တဲ့ အချိန်မှာ သူ့ရဲ့ in_time ဒါမှမဟုတ်
          // out_time ဟာ null ဖြစ်နေမှ request ပေးတင်မယ်လို့စစ်တာ
          const { AttendanceLeave } = await Users.findOne({
            attributes: ["AttendanceLeave"],
            where: {
              id: objects.UserId,
            },
          });
          if (!parseInt(AttendanceLeave) > 0) {
            return {
              isSuccess: false,
              message: "You don't have any attendance leave count",
            };
          }
          await Users.decrement("AttendanceLeave", {
            by: 1,
            where: { id: objects.UserId },
          });
          await Attendance_Record.create({
            reason: objects.reason,
            date: objects.date,
            UserId: objects.UserId,
          });
          return {
            isSuccess: true,
            message: "Successfully Requested To HR",
          };
        } else {
          return {
            isSuccess: false,
            message: `You already click ${timeLateSector}. So, you cannot take request...`,
          };
        }
      } else {
        return {
          isSuccess: false,
          message: `You already requested for this ${timeLateSector}`,
        };
      }
    } catch (error) {
      console.log("Error while adding new user : ", error);
      throw new Error(error);
    }
  }
}

module.exports = UserHelper;
