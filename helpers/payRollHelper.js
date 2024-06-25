const {
  Attendance,
  LeaveRecord,
  Users,
  Holidays,
  Payroll,
  Department,
} = require("../models");
const { Op } = require("sequelize");
const dateHelper = require("./dateHelper");
class payRollHelper {
  // တရက်စာရဲ့ payroll ကို တွက်
  static async salaryPerDay(salary, totalDays, endDate, start) {
    let payrollRate = 0;
    console.log("start pooo", start);
    console.log("end pp", endDate);

    if (
      start.toISOString().slice(0, 10) <= endDate.toISOString().slice(0, 10)
    ) {
      payrollRate = salary / totalDays;
    } else {
      payrollRate = 0;
    }
    return payrollRate;
  }

  static async penalty(userId, startDate, endDate) {
    let count = 0;
    let fund = 0;
    const user = await Users.findByPk(userId);
    const salary = user.Salary;
    const attendanceRecords = await Attendance.findAll({
      where: { UserId: userId, date: { [Op.between]: [startDate, endDate] } },
    });
    attendanceRecords.map((record) => {
      if (record.late_in_time > 0 || record.early_out_time > 0) count++;
    });
    console.log("count", count);

    // တခါနောက်ကျရင် 5000 , နှစ်ခါနောက်ကျရင် 10000, သုံးခါအထက် ဆိုရင် လစာရဲ့ 5%
    if (count === 1) {
      fund = 5000;
    } else if (count === 2) {
      fund = 10000;
    } else if (count >= 3) {
      fund = salary * 0.05;
    }
    return { fund, count };
  }
  // တလမှာ အလုပ်လုပ်တဲ့ ရက်ပေါင်း
  static async totalDaysWorked(userId, startDate, endDate) {
    let totalDaysWork = 0;
    const user = await Users.findByPk(userId);
    const createdAt = user.createdAt.toISOString().slice(0, 10);
    const attendanceRecord = await Attendance.findOne({
      where: { UserId: userId },
    });
    console.log("attendance record", attendanceRecord);

    try {
      const leaveDate = new Set();
      const attendanceCount = await Attendance.count({
        where: { UserId: userId, date: { [Op.between]: [startDate, endDate] } },
      });

      totalDaysWork += attendanceCount;
      console.log("attendance count", attendanceCount, "userId", userId);

      const holidayCount = await Holidays.count({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
            [Op.notIn]: Array.from(leaveDate),
          },
        },
      });
      totalDaysWork += holidayCount;
      console.log("holiday count", holidayCount, "userId", userId);

      const weekendsInfo = dateHelper.getWeekends(startDate, endDate);
      console.log("weekends Info", weekendsInfo);
      const nonOverlappingWeekends = weekendsInfo.weekends.map((weekend) => {
        !leaveDate.has(weekend);
      });
      totalDaysWork += nonOverlappingWeekends.length;
      console.log(
        "weekend count",
        nonOverlappingWeekends.length,
        "userId",
        userId
      );

      const leaveRecords = await LeaveRecord.findAll({
        attributes: ["UserId", "from", "to"],
        where: {
          UserId: userId,
          status: "Approved",
          from: { [Op.between]: [startDate, endDate] }, // Filter records for the current month
          to: { [Op.between]: [startDate, endDate] },
        },
      });

      //leaveRecords.forEach(async (leaveRecord) => {
      for (const leaveRecord of leaveRecords) {
        const startDate = new Date(leaveRecord.from);
        const endDate = new Date(leaveRecord.to);
        let count = 0;

        // စတင်ရက်နဲ့ အဆုံးရက်ကြားမှာ ရှိတဲ့ ရက်စွဲတွေကို ထုတ်ယူမယ်။
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const formattedDate = d.toISOString().slice(0, 10);
          if (formattedDate <= endDate.toISOString().slice(0, 10)) {
            const isAttendanceDate = await Attendance.findOne({
              where: { UserId: userId, date: formattedDate },
            });
            if (!isAttendanceDate) {
              count++;
              leaveDate.add(formattedDate);
            }
            // console.log("leave count", count , "userid", userId);
            // console.log("leave", leaveDate.add(formattedDate));
          }
        }
        totalDaysWork += count;
        console.log("leave count1", count, "userId", userId);
        console.log("total days work 1", totalDaysWork, "userId", userId);
      }

      //});

      console.log("total days work finished", totalDaysWork, "userid", userId);
      return totalDaysWork;
    } catch (error) {
      console.error(error);
    }
    console.log("total days work 2", totalDaysWork);
    return totalDaysWork;
  }
  static async getUsersWithPayrollFilters({
    username,
    employeeId,
    position,
    department,
    page,
    size,
  }) {
    const whereUser = {
      ...(username && { username: { [Op.like]: `%${username}%` } }),
      ...(employeeId && { EmployeeId: { [Op.like]: `%${employeeId}%` } }),
      ...(position && { Position: { [Op.like]: `%${position}%` } }),
    };

    const totalCount = await Payroll.count();
    const totalPage = Math.ceil(totalCount / size);

    const order = [[Users, "username", "ASC"]];
    const users = await Payroll.findAll({
      include: [
        {
          model: Users,
          attributes: [
            "username",
            "EmployeeId",
            "Position",
            "Salary",
            "createdAt",
          ],
          where: whereUser,
          raw: true,
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
    return { users, totalPage, totalCount };
  }
}
module.exports = payRollHelper;
