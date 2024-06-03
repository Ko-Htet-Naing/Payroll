const { Users, Attendance, Holidays, LeaveRecord } = require("../models");
const { Op } = require("sequelize");
class UserHelper {
  // တရက်စာရဲ့ payroll ကို တွက်
  static async salaryPerDay(users, totalDays) {
    const monthlySalary = users.Salary;
    console.log("monthlySalary", monthlySalary);

    const payrollRate = monthlySalary / totalDays;
    return payrollRate;
  }

  // တလစာ weekend ရဲ့ list
  static getWeekends(startDate, endDate) {
    let currentDate = new Date(startDate);
    let weekends = [];
    let count = 0;

    while (currentDate <= endDate) {
      // တနင်္ဂနွေနဲ့ စနေတို့ကို စစ်ဆေးမယ်။
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        weekends.push(currentDate.toISOString().slice(0, 10));
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("count", count);
    console.log("weekend", weekends);
    return weekends;
  }

  // user တယောက်ရဲ့ attendance record
  static async attendanceRecord(userId, startDate, endDate, totalDays, users) {
    const today = new Date();

    const currentDate = today.toISOString().slice(0, 10);
    console.log(today);

    // Initiate all database queries concurrently
    const [leaveRecords, attendanceRecords, publicHolidays] = await Promise.all(
      [
        LeaveRecord.findAll({
          where: {
            UserId: userId,
            status: "Approved",
            from: { [Op.between]: [startDate, endDate] },
            to: { [Op.between]: [startDate, endDate] },
          },
        }),
        Attendance.findAll({
          attributes: ["date"],
          where: {
            UserId: userId,
            date: { [Op.between]: [startDate, endDate] },
          },
        }),
        Holidays.findAll({
          attributes: ["date"],
          where: { date: { [Op.between]: [startDate, endDate] } },
        }),
      ]
    );

    let userAttendanceList = [];

    const payrollRate = await this.salaryPerDay(users, totalDays);

    leaveRecords.map((leaveRecord) => {
      const startDate = new Date(leaveRecord.from);
      const endDate = new Date(leaveRecord.to);

      // စတင်ရက်နဲ့ အဆုံးရက်ကြားမှာ ရှိတဲ့ ရက်စွဲတွေကို ထုတ်ယူမယ်။
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const formattedDate = d.toISOString().slice(0, 10);
        if (formattedDate <= currentDate) {
          const leave = {
            date: formattedDate,
            type: leaveRecord.leaveType,
            payrollRate: Math.floor(payrollRate),
          };
          userAttendanceList.push(leave);
        }
      }
    });

    publicHolidays.map((record) => {
      const date = record.date;
      console.log(date);
      if (record.data <= currentDate) {
        const publicHoliday = {
          date: record.date,
          type: "holiday",
          payrollRate: Math.floor(payrollRate),
        };

        userAttendanceList.push(publicHoliday);
      }
    });

    this.getWeekends(startDate, endDate).map((weekend) => {
      if (weekend <= currentDate) {
        const holiday = {
          date: weekend,
          type: "holiday",
          payrollRate: Math.floor(payrollRate),
        };

        userAttendanceList.push(holiday);
      }
    });

    attendanceRecords.map((record) => {
      const date = record.date;
      console.log(date);
      const attendanceList = {
        date: record.date,
        type: "present",
        payrollRate: Math.floor(payrollRate),
      };

      userAttendanceList.push(attendanceList);
    });

    const updatedData = this.fillAbsentDates(
      userAttendanceList,
      startDate,
      today
    );
    return updatedData;
  }

  static fillAbsentDates(data, startDate, today) {
    const dateSet = new Set(data.map((item) => item.date)); // Collect all existing dates from data
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const formattedDate = currentDate.toISOString().slice(0, 10);
      if (!dateSet.has(formattedDate)) {
        data.push({
          date: formattedDate,
          type: "absent",
          payrollRate: 0, // Assuming payroll rate for absent is 0
        });
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return data.sort((a, b) => a.date.localeCompare(b.date)); // Sort the data by date
  }
  static async userListById(userId, startDate, endDate, totalDays, res) {
    const users = await Users.findByPk(userId);

    const attendance = await this.attendanceRecord(
      userId,
      startDate,
      endDate,
      totalDays,
      users
    );
    res.json({
      columns: [
        { Header: "Date", accessor: "date" },
        { Header: "Type", accessor: "type" },
        { Header: "Payroll Rate", accessor: "payrollRate" },
      ],
      username: users.username,
      datas: attendance,
    });
  }
}

module.exports = UserHelper;
