const { Users } = require("../models");
const userHelper = require("../helpers/UserHelper");

const getPayrollForThisMonth = async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  console.log("month", month);
  const monthName = today.toLocaleString("en-Us", { month: "long" });
  console.log("hi");
  console.log("month name", monthName);

  const startDate = new Date(
    Date.UTC(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 26)
  );

  // Set the end date to the 25th of the current month
  const endDate = new Date(Date.UTC(year, month, 25));

  // const startDate = new Date(Date.UTC(year, month, 1));
  // const endDate = new Date(Date.UTC(year, month + 1, 0));
  let Difference_In_Time = endDate.getTime() - startDate.getTime();

  // Calculating the no. of days between
  // two dates
  let totalDays = Math.round(Difference_In_Time / (1000 * 3600 * 24)) + 1;

  // const total = (endDate - startDate).getDate();

  console.log("total", totalDays);

  console.log(startDate.toISOString());
  console.log(endDate.toISOString());

  const users = await Users.findAll({
    attributes: ["id", "username", "Salary"],
  });

  // Query attendance records for this month

  const userListWithCalculatedPayroll = await Promise.all(
    users.map(async (user) => {
      if (today === today) {
        const calculatePayroll = await payRollHelper.calculatePayroll(
          user.id,
          startDate,
          endDate,
          year,
          month,
          totalDays
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

// get payroll each user by id

const AttendanceListByUserId = async (req, res) => {
  const userId = req.params.id;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  console.log("date", date);

  console.log("month", month);

  // const monthName = today.toLocaleString("en-Us", { month: "long" });
  // console.log("month name", monthName);

  let startDate, endDate;

  if (date > 25) {
    startDate = new Date(Date.UTC(year, month, 26));
    endDate = new Date(Date.UTC(year, month + 1, 25));
    console.log("start Date", startDate);
    console.log("end date", endDate);
  } else {
    startDate = new Date(Date.UTC(year, month - 1, 26));
    endDate = new Date(Date.UTC(year, month, 25));
    console.log("start Date", startDate);
    console.log("end date", endDate);
  }
  let Difference_In_Time = endDate.getTime() - startDate.getTime();

  // Calculating the no. of days between two dates
  let totalDays = Math.round(Difference_In_Time / (1000 * 3600 * 24)) + 1;

  console.log("total", totalDays);

  await userHelper.userListById(userId, startDate, endDate, totalDays, res);
};

module.exports = { AttendanceListByUserId };
