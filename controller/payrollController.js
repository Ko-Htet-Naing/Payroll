const { Attendance, Users, LeaveRecords } = require("../models");
const payRollHelper = require("../helpers/payRollHelper");

const getPayrollForThisMonth = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  console.log(startDate.toISOString());
  console.log(endDate.toISOString());

  const users = await Users.findAll({
    attributes: ["id", "username", "Salary"],
  });

  // Query attendance records for the month

  const userListWithCalculatedPayroll = await Promise.all(
    users.map(async (user) => {
      const calculatePayroll = await payRollHelper.calculatePayroll(
        user.id,
        startDate,
        endDate,
        year,
        month
      );

      await user.update({ Payroll: calculatePayroll });

      return {
        id: user.id,
        username: user.username,
        payroll: calculatePayroll,
      };
    })
  );

  res.status(200).json({ "total salary": userListWithCalculatedPayroll });
};

module.exports = { getPayrollForThisMonth };
