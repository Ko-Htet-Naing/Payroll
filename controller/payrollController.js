const { Users, Payroll, Department } = require("../models");
const userHelper = require("../helpers/UserHelper");
const payRollHelper = require("../helpers/payRollHelper");
const validationHelper = require("../helpers/validateHelper");
const dateHelper = require("../helpers/dateHelper");
let monthNum = 0;
let year = 0;
let monthname = null;
//let startDate, endDate;
const getPayrollForOneMonth = async (req, res) => {
  const page = Math.max(0, Number.parseInt(req.query.page) || 0);
  const size = Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10);
  const { department, position, username, employeeId } = req.query;
  monthname = req.query.monthname;
  year = new Date(req.query.year).getFullYear();

  const validation = validationHelper.validateMonth(monthname);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message });
  }
  monthNum = validation.monthNum;

  const today = new Date();
  // eg, 2023-12-26 to 2024-01-25
  const startMonth = monthNum - 2;
  console.log("startMonth", startMonth);

  const startDate = new Date(Date.UTC(year, startMonth, 26));
  const endDate = new Date(Date.UTC(year, monthNum - 1, 25));

  const totalDays = await dateHelper.totalDays(startDate, endDate);

  console.log("total", totalDays);

  const { users, totalPage, totalCount } =
    await payRollHelper.getUsersWithPayrollFilters({
      username,
      employeeId,
      position,
      department,
      page,
      size,
    });

  // Query attendance records for this month

  const userListWithCalculatedPayroll = await Promise.all(
    users.map(async (user) => {
      const userId = await Users.findOne({ where: { id: user.UserId } });
      const createdAt = userId?.createdAt;
      let start = startDate;
      if (
        createdAt.toISOString().slice(0, 10) >= start.toISOString().slice(0, 10)
      ) {
        start = createdAt;
      }

      if (
        endDate instanceof Date &&
        !isNaN(endDate) &&
        endDate.toISOString().slice(0, 10) <= today.toISOString().slice(0, 10)
      ) {
        const penalty = await payRollHelper.penalty(
          user.UserId,
          start,
          endDate
        );
        const fund = penalty.fund;
        const count = penalty.count;

        const totalDaysWorked = await payRollHelper.totalDaysWorked(
          user.UserId,
          start,
          endDate
        );
        console.log("start date11", start, "userId", user.UserId);
        const payrollRate = await payRollHelper.salaryPerDay(
          user.User.Salary,
          totalDays,
          endDate,
          start
        );

        const calculatePayroll = totalDaysWorked * payrollRate - fund;

        await user.update({
          payrollRate: payrollRate,
          attendance: totalDaysWorked,
          penalty: fund,
          payroll: calculatePayroll,
        });
        return {
          id: user.id,
          username: user.User.username,
          employeeId: user.User.EmployeeId,
          position: user.User.Position,
          salary: user.User.Salary,
          deptName: user.User.Department.deptName,
          attendance: user.attendance,
          payrollRate: user.payrollRate,
          penalty: user.penalty,
          count: count,
          payroll: user.payroll,
          userId: user.UserId,
          createdAt: createdAt,
        };
      } else {
        await user.update({
          payrollRate: 0,
          attendance: 0,
          penalty: 0,
          payroll: 0,
        });
        return {
          id: user.id,
          username: user.User.username,
          employeeId: user.User.EmployeeId,
          position: user.User.Position,
          salary: user.User.Salary,
          deptName: user.User.Department.deptName,
          attendance: user.attendance,
          payrollRate: user.payrollRate,
          penalty: user.penalty,
          count: 0,
          payroll: user.payroll,
          userId: user.UserId,
          createdAt: createdAt,
        };
      }
    })
  );

  res.status(200).json({
    columns: [
      { Header: "username", accessor: "username" },
      { Header: "employeeId", accessor: "employeeId" },
      { Header: "position", accessor: "position" },
      { Header: "salary", accessor: "salary" },
      { Header: "department name", accessor: "deptName" },
      { Header: "attendance", accessor: "attendance" },
      { Header: "payroll rate", accessor: "payrollRate" },
      { Header: "penalty", accessor: "penalty" },
      { Header: "penalty count", accessor: "count" },
      { Header: "payroll", accessor: "payroll" },
    ],
    datas: userListWithCalculatedPayroll,
    totalPage: totalPage,
    totalCount: totalCount,
  });
};

// တယောက်ချင်းစီရဲ့ record

const AttendanceListByUserId = async (req, res) => {
  const page = Math.max(0, Number.parseInt(req.query.page) || 0);
  const size = Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10);

  const userId = req.params.UserId;
  const user = await Users.findByPk(userId);
  const createdAt = user?.createdAt;
  const today = new Date();

  const validation = validationHelper.validateMonth(monthname);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.message });
  }
  monthNum = validation.monthNum;

  const startMonth = monthNum - 2;
  let startDate, endDate;

  startDate = new Date(Date.UTC(year, startMonth, 26));

  endDate = new Date(Date.UTC(year, monthNum - 1, 25));

  const totalDays = await dateHelper.totalDays(startDate, endDate);

  if (
    createdAt.toISOString().slice(0, 10) >= startDate.toISOString().slice(0, 10)
  ) {
    startDate = createdAt;
    if (
      startDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
    ) {
      endDate = startDate;
    } else if (
      startDate.toISOString().slice(0, 10) < today.toISOString().slice(0, 10) &&
      endDate.toISOString().slice(0, 10) >= today.toISOString().slice(0, 10)
    ) {
      endDate = today;
    }
  } else {
    endDate = today;
  }
  await userHelper.userListById(
    userId,
    startDate,
    endDate,
    totalDays,
    res,
    page,
    size
  );
};

module.exports = { AttendanceListByUserId, getPayrollForOneMonth };
