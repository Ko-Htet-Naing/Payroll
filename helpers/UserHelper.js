const { Users, Attendance, Holidays, LeaveRecord } = require("../models");
const dateHelper = require("./dateHelper");
const payRollHelper = require("../helpers/payRollHelper");
const { Op } = require("sequelize");
class UserHelper {
  // user တယောက်ရဲ့ attendance record
  static async attendanceRecord(
    userId,
    startDate,
    endDate,
    totalDays,
    users,
    page = 0,
    size = 10
  ) {
    const salary = users.Salary;
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
        // console.log("Holiday",)
      ]
    );

    let userAttendanceList = [];
    let totalPayroll = 0;
    const leaveDate = new Set();

    const payrollRate = await payRollHelper.salaryPerDay(
      salary,
      totalDays,
      endDate,
      startDate
    );

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
        if (formattedDate <= endDate.toISOString().slice(0, 10)) {
          const isAttendanceDate = attendanceRecords.some(
            (record) => record.date === formattedDate
          );

          if (!isAttendanceDate) {
            const leave = {
              date: formattedDate,
              type: leaveRecord.leaveType,
              payrollRate: Math.floor(payrollRate),
            };
            totalPayroll += payrollRate;
            userAttendanceList.push(leave);
            const dates = leaveDate.add(formattedDate);
            console.log("leaveDate", dates);
          }
        }
      }
    });

    publicHolidays.map((record) => {
      const date = record.date;
      if (date <= endDate.toISOString().slice(0, 10) && !leaveDate.has(date)) {
        const publicHoliday = {
          date: date,
          type: "holiday",
          payrollRate: Math.floor(payrollRate),
        };

        totalPayroll += payrollRate;
        userAttendanceList.push(publicHoliday);
      }
    });

    const weekendsInfo = dateHelper.getWeekends(startDate, endDate);
    weekendsInfo.weekends.map((weekend) => {
      if (
        weekend <= endDate.toISOString().slice(0, 10) &&
        !leaveDate.has(weekend)
      ) {
        const holiday = {
          date: weekend,
          type: "holiday",
          payrollRate: Math.floor(payrollRate),
        };

        console.log("holiday", holiday);
        totalPayroll += payrollRate;
        userAttendanceList.push(holiday);
      }
    });

    attendanceRecords.map((record) => {
      const attendanceList = {
        date: record.date,
        type: "present",
        payrollRate: Math.floor(payrollRate),
      };

      totalPayroll += payrollRate;
      userAttendanceList.push(attendanceList);
    });

    const updatedData = this.fillAbsentDates(
      userAttendanceList,
      startDate,
      endDate
    );
    const totalCount = updatedData.length;
    const totalPage = Math.ceil(totalCount / size);
    const paginatedData = this.paginateData(updatedData, page, size);
    return { paginatedData, totalPayroll, totalCount, totalPage };
  }

  // pagination
  static paginateData(data, page, size) {
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = data.slice(startIndex, endIndex);

    return paginatedData;
  }
  static fillAbsentDates(data, startDate, endDate) {
    const dateSet = new Set(data.map((item) => item.date)); // Collect all existing dates from data
    let currentDate = new Date(startDate);
    while (
      currentDate.toISOString().slice(0, 10) <=
      endDate.toISOString().slice(0, 10)
    ) {
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

  static async userListById(
    userId,
    startDate,
    endDate,
    totalDays,
    res,
    page = 0,
    size
  ) {
    const users = await Users.findByPk(userId);

    const attendance = await this.attendanceRecord(
      userId,
      startDate,
      endDate,
      totalDays,
      users,
      page,
      size
    );
    res.json({
      columns: [
        { Header: "Date", accessor: "date" },
        { Header: "Type", accessor: "type" },
        { Header: "Payroll Rate", accessor: "payrollRate" },
      ],
      username: users.username,
      datas: attendance.paginatedData,
      totalPayroll: attendance.totalPayroll,
      totalPage: attendance.totalPage,
      totalCount: attendance.totalCount,
      createdAt: users.createdAt,
    });
  }
}

module.exports = UserHelper;
