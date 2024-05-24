// လကုန်လို့ update လုပ်ချင်တာတွေ အကုန် ဒီ file မှာ update လာလုပ်ပါ...

const { Users } = require("../models");
async function updateLeaveValue() {
  // Default Values
  const defaultValue = {
    AnnualLeave: 16,
    MedicalLeave: 6,
    AttendanceLeave: 3,
  };
  try {
    await Users.update(
      {
        AnnualLeave: defaultValue.AnnualLeave,
        MedicalLeave: defaultValue.MedicalLeave,
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
