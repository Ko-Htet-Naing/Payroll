const { Users } = require("../models");
const payRollHelper = require("../helpers/payRollHelper");

const getPayrollForPrevMonth = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const prevMonth = today.getMonth() - 1;

  // const prevstartDate = new Date(
  //   Date.UTC(
  //     prevMonth === 0 ? year - 1 : year,
  //     prevMonth === 0 ? 11 : prevMonth - 1,
  //     26
  //   )
  // );

  // Set the end date to the 25th of the current month
  // const prevendDate = new Date(Date.UTC(year, prevMonth, 25));

  const prevstartDate = new Date(Date.UTC(year, prevMonth, 1));
  const prevendDate = new Date(Date.UTC(year, prevMonth + 1, 0));

  console.log(prevstartDate.toISOString());
  console.log(prevendDate.toISOString());

  const users = await Users.findAll({
    attributes: ["id", "username", "Salary"],
  });

  // Query attendance records for previous month

  const userListWithCalculatedPayroll = await Promise.all(
    users.map(async (user) => {
      if (prevendDate < today) {
        const calculatePayroll = await payRollHelper.calculatePayroll(
          user.id,
          prevstartDate,
          prevendDate,
          year,
          prevMonth
        );

        await user.update({ Payroll: calculatePayroll });

        return {
          id: user.id,
          username: user.username,
          payroll: calculatePayroll,
        };
      }
    })
  );

  res
    .status(200)
    .json({ "total previous salary": userListWithCalculatedPayroll });
};

const getPayrollForThisMonth = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // const startDate = new Date(
  //   Date.UTC(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 26)
  // );

  // Set the end date to the 25th of the current month
  // const endDate = new Date(Date.UTC(year, month, 25));

  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  console.log(startDate.toISOString());
  console.log(endDate.toISOString());

  const users = await Users.findAll({
    attributes: ["id", "username", "Salary"],
  });

  // Query attendance records for this month

  const userListWithCalculatedPayroll = await Promise.all(
    users.map(async (user) => {
      if (endDate === today) {
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
      } else {
        await user.update({ Payroll: 0 });
      }
    })
  );

  res.status(200).json({ "total salary": userListWithCalculatedPayroll });
};

module.exports = { getPayrollForThisMonth, getPayrollForPrevMonth };
