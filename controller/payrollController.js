const { Attendance, Users, LeaveRecords } = require("../models");
const payRollHelper = require("../helpers/payRollHelper");

const getPayrollForThisMonth = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const userId = 1;

  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  console.log(startDate.toISOString());
  console.log(endDate.toISOString());

  // Query attendance records for the month

  const weekendCount = payRollHelper.countWeekends(year, month);
  console.log("weekend count", weekendCount);
  console.log("userid", userId);

  const totalHourWork = await payRollHelper.calculateTotalHoursForMonth(
    userId,
    startDate,
    endDate
  );
  console.log("total hour ", totalHourWork);
  res
    .status(200)
    .json({ weekendCount: weekendCount, totalHourWork: totalHourWork });
};

module.exports = { getPayrollForThisMonth };
