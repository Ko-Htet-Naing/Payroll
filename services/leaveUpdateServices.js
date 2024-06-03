// လကုန်လို့ update လုပ်ချင်တာတွေ အကုန် ဒီ file မှာ update လာလုပ်ပါ...

const { Users } = require("../models");
async function updateLeaveValue() {
  // Default Values
  const defaultValue = {
    AttendanceLeave: 3,
  };
  try {
    await Users.update(
      {
        AttendanceLeave: defaultValue.AttendanceLeave,
      },
      { where: {} }
    );
  } catch (error) {
    console.log("Error while reseting leave value : ", error);
    throw new Error(error);
  }
}
module.exports = updateLeaveValue;
