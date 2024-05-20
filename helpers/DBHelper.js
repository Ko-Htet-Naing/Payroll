const { Users, Attendance } = require("../models");

class UserHelper {
  /**
   * Check if a user exists in database
   *
   * @param {string} userId - The ID of the user to check.
   * @returns {Promise<boolean>} - Returns true if the user exists, otherwise false.
   * @returns {Promise<String>} - Returns string value rely on user exists
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

        if (isInTimeNull?.in_time === null) {
          try {
            await Attendance.update(
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
            // await Users.update({
            //   AttendanceLeave :
            // })
          } catch (error) {
            console.log(
              "Error while updating morning user data in attendance table",
              error
            );
            throw new Error("Error while updating user");
          }
          return "Update Successful";
        } else {
          return "Update Unsuccessful";
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
            const data = await Attendance.update(
              { out_time: "16:30" },
              {
                where: {
                  UserId: userId,
                  date: userDate,
                },
              }
            );
            console.log(data);
          } catch (error) {
            console.log(
              "Error while updating evening user data in attendance table",
              error
            );
            throw new Error("Error while updating user");
          }
          return "Update Successful";
        } else {
          return "Update Unsuccessful";
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
      const count = await Users.findOne(
        { attributes: "AttendanceLeave" },
        {
          where: {
            id: userId,
          },
        }
      );
      if (count === 0) return false;
      return true;
    } catch (error) {
      console.log("Error while finding attendance leave count", error);
      throw new Error("Error while finding attendance leave");
    }
  }
}

module.exports = UserHelper;
