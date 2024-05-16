const { Users } = require("../models");

class UserHelper {
  /**
   * Check if a user exists in database
   *
   * @param {string} userId - The ID of the user to check.
   * @returns {Promise<boolean>} - Returns true if the user exists, otherwise false.
   * @throws {Error} - Throws an error if the database query fails.
   */

  static async checkUserInDB(userId) {
    try {
      const user = await Users.findByPk(userId);
      return !!user; // return true if user exists, otherwise false
    } catch (error) {
      console.log("Error while finding user in database : ", error);
      throw new Error("Database query failed");
    }
  }
}

module.exports = UserHelper;
