const { Users, Payroll, Department } = require("../models");
const userHelper = require("../helpers/UserHelper");
const payRollHelper = require("../helpers/payRollHelper");

// တလချင်းစီမှာ ရှိတဲ့ user ရဲ့ payroll
const getPayrollForOneMonth = async (req, res) => {
  const page = Math.max(0, Number.parseInt(req.query.page) || 0);
  const size = Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10);
  const department = req.query.department;
  const position = req.query.position;
  const username = req.query.username;
  const employeeId = req.query.employeeId;
  const monthname = req.query.monthname;
  const monthNum = payRollHelper.monthNumber(monthname);
  if (!monthNum) {
    return res.status(400).send("Month query parameter is required.");
  }

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res
      .status(400)
      .send("Invalid month. Please provide a value between 1 and 12.");
  }

  const today = new Date();
  const year = today.getFullYear();
  // eg, 2023-12-26 to 2024-01-25
  const startMonth = monthNum - 2;
  const startDate = new Date(Date.UTC(year, startMonth, 26));
  const endDate = new Date(Date.UTC(year, monthNum - 1, 25));

  console.log("start Date", startDate);
  console.log("end date", endDate);

  const totalDays = await userHelper.totalDays(startDate, endDate);

  console.log("total", totalDays);

  const whereUser = {
    ...(username && { username: { [Op.like]: `%${username}%` } }),
    ...(employeeId && { EmployeeId: employeeId }),
    ...(position && { Position: position }),
  };

  const totalCount = await Payroll.count();
  const totalPage = Math.ceil(totalCount / size);

  const order = [[Users, "username", "ASC"]];
  const users = await Payroll.findAll({
    include: [
      {
        model: Users,
        attributes: ["username", "EmployeeId", "Position", "Salary"],
        where: whereUser,
        include: [
          {
            model: Department,
            attributes: ["deptName"],
            ...(department && { where: { deptName: department } }),
          },
        ],
      },
    ],
    order: order,
    limit: size,
    offset: page * size,
  });

  // Query attendance records for this month

  const userListWithCalculatedPayroll = await Promise.all(
    users.map(async (user) => {
      if (
        endDate.toISOString().slice(0, 10) < today.toISOString().slice(0, 10)
      ) {
        const penalty = await payRollHelper.penalty(
          user.UserId,
          startDate,
          endDate
        );
        const totalDaysWorked = await payRollHelper.totalDaysWorked(
          user.UserId,
          startDate,
          endDate
        );
        const payrollRate = await userHelper.salaryPerDay(
          user.User.Salary,
          totalDays
        );

        const calculatePayroll = totalDaysWorked * payrollRate - penalty;

        await user.update({
          payrollRate: payrollRate,
          attendance: totalDaysWorked,
          penalty: penalty,
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
          payroll: user.payroll,
          userId: user.UserId,
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
          payroll: user.payroll,
          userId: user.UserId,
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
      { Header: "payroll", accessor: "payroll" },
    ],
    datas: userListWithCalculatedPayroll,
    totalPage: totalPage,
    totalCount: totalCount,
  });
};

// တယောက်ချင်းစီရဲ့ record

const AttendanceListByUserId = async (req, res) => {
  const userId = req.params.id;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();

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

  const totalDays = await userHelper.totalDays(startDate, endDate);
  console.log("total Days", totalDays);
  await userHelper.userListById(userId, startDate, endDate, totalDays, res);
};

module.exports = { AttendanceListByUserId, getPayrollForOneMonth };
