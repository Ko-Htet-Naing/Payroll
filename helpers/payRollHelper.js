const { Attendance, LeaveRecord, Users, Holidays } = require("../models");
const { Op } = require("sequelize");
const UserHelper = require("../helpers/UserHelper");

class payRollHelper {
  static monthNumber(monthName) {
    switch (monthName) {
      case "January":
        return 1;
      case "February":
        return 2;
      case "March":
        return 3;
      case "April":
        return 4;
      case "May":
        return 5;
      case "June":
        return 6;
      case "July":
        return 7;
      case "August":
        return 8;
      case "September":
        return 9;
      case "October":
        return 10;
      case "November":
        return 11;
      case "December":
        return 12;
    }
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
    return fund;
  }
  // တလမှာ အလုပ်လုပ်တဲ့ ရက်ပေါင်း
  static async totalDaysWorked(userId, startDate, endDate) {
    console.log("start Date: ", startDate);
    console.log("end date", endDate);
    let totalDaysWork = 0;

    try {
      const attendanceCount = await Attendance.count({
        where: { UserId: userId, date: { [Op.between]: [startDate, endDate] } },
      });

      totalDaysWork += attendanceCount;

      console.log("attendance count", attendanceCount, "userId", userId);

      const holidayCount = await Holidays.count({
        where: { date: { [Op.between]: [startDate, endDate] } },
      });
      totalDaysWork += holidayCount;

      console.log("holiday count", holidayCount);

      const weekends = UserHelper.getWeekends(startDate, endDate);
      totalDaysWork += weekends.count;
      console.log("weekend count", weekends.count);

      const leaveRecords = await LeaveRecord.findAll({
        where: {
          UserId: userId,
          status: "Approved",
          from: { [Op.between]: [startDate, endDate] }, // Filter records for the current month
          to: { [Op.between]: [startDate, endDate] },
        },
      });

      leaveRecords.map((leaveRecord) => {
        const startDate = new Date(leaveRecord.from);
        const endDate = new Date(leaveRecord.to);
        let count = 0;
        console.log("startDate", startDate);
        console.log("endDate", endDate);

        // စတင်ရက်နဲ့ အဆုံးရက်ကြားမှာ ရှိတဲ့ ရက်စွဲတွေကို ထုတ်ယူမယ်။
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const formattedDate = d.toISOString().slice(0, 10);
          if (formattedDate <= endDate.toISOString().slice(0, 10)) {
            console.log("formatted Date", formattedDate);
            count++;
          }
        }
        totalDaysWork += count;
        console.log("leave count", count, "userId", userId);
      });
      return totalDaysWork;
    } catch (error) {
      console.error(error);
    }
  }

  // static async calculateTotalHoursForMonth(userId, startDate, endDate) {
  //   try {
  //     // Query attendance records for the month
  //     const attendanceRecords = await Attendance.findAll({
  //       where: {
  //         UserId: userId,
  //         date: { [Op.between]: [startDate, endDate] }, // Filter records for the current month
  //       },
  //     });

  //     // Query leave records for the month with status "approved"
  //     const leaveRecords = await LeaveRecord.findAll({
  //       where: {
  //         UserId: userId,
  //         status: "Approved",
  //         from: { [Op.between]: [startDate, endDate] }, // Filter records for the current month
  //         to: { [Op.between]: [startDate, endDate] },
  //       },
  //     });

  //     // Calculate total hours worked by summing up the hours from attendance records
  //     let totalHoursWorked = 0;
  //     //console.log(totalHoursWorked);

  //     attendanceRecords.forEach((record) => {
  //       if (record.in_time !== null && record.out_time !== null) {
  //         console.log(`Processing attendance record: ${record.date}`);

  //         const actualInTime = new Date(`${record.date}T${record.in_time}`);
  //         const actualOutTime = new Date(`${record.date}T${record.out_time}`);

  //         // Adjust in_time and out_time to 08:30 and 16:30 respectively if within range
  //         const startOfWorkDay = new Date(`${record.date}T08:30:00`);
  //         const endOfWorkDay = new Date(`${record.date}T16:30:00`);

  //         const inTime =
  //           actualInTime < startOfWorkDay ? startOfWorkDay : actualInTime;
  //         const outTime =
  //           actualOutTime >= endOfWorkDay ? endOfWorkDay : actualOutTime;

  //         let hoursWorked = (outTime - inTime) / (1000 * 60 * 60); // Convert milliseconds to hours

  //         if (record.late_in_time) {
  //           hoursWorked -= record.late_in_time / 60;
  //         }

  //         if (record.early_out_time) {
  //           hoursWorked -= record.early_out_time / 60;
  //         }
  //         // console.log(
  //         //   `In Time: ${inTime}, Out Time: ${outTime}, Hours Worked: ${hoursWorked}`
  //         // );

  //         totalHoursWorked += hoursWorked;
  //       }
  //     });

  //     leaveRecords.forEach((leave) => {
  //       const leaveStart = new Date(leave.from);
  //       const leaveEnd = new Date(leave.to);
  //       const leaveDays =
  //         Math.floor((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1; // inclusive of both start and end
  //       //console.log(leaveDays);

  //       if (
  //         leaveRecords.leaveType === "Medical Leave" ||
  //         leaveRecords.leaveType === "Annual Leave"
  //       ) {
  //         totalHoursWorked += leaveDays * 8;
  //       } else {
  //         totalHoursWorked += leaveDays * 4;
  //       }
  //     });
  //     return totalHoursWorked;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // static async calculatePayrollForOneMonth(
  //   userId,
  //   startDate,
  //   endDate,
  //   totalDays
  // ) {
  //   try {
  //     const countWeekends = UserHelper.getWeekends(startDate, endDate);
  //     const salaryPerDay = await UserHelper.salaryPerDay(userId);

  //     // const users = await Users.findAll({ where: { id: userId } });
  //     // const user = users[0];
  //     // const monthlySalary = user.Salary;
  //     // console.log("monthlySalary", monthlySalary);
  //     // const payrollRate = monthlySalary / totalDays;
  //     // console.log("payroll rate", payrollRate);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // static async calculatePayroll(
  //   userId,
  //   startDate,
  //   endDate,
  //   year,
  //   month,
  //   totalDays
  // ) {
  //   try {
  //     const countWeekends = UserHelper.getWeekends(startDate, endDate);
  //     const salaryPerDay = await UserHelper.salaryPerDay(userId, totalDays);
  //     // const users = await Users.findAll({ where: { id: userId } });

  //     // const user = users[0];
  //     // const monthlySalary = user.Salary;
  //     // console.log("monthlysalary", monthlySalary);
  //     // // const totalDays = endDate.getDate();
  //     // const workHourPerDay = 8;

  //     console.log("count weekend", this.countWeekends(startDate, endDate));

  //     const totalRate =
  //       (totalDays - this.countWeekends(year, month)) * workHourPerDay;
  //     // console.log("totalRate", totalRate);

  //     console.log("totalDays", totalDays);

  //     const hourlyRate = monthlySalary / totalRate;

  //     //console.log("hourlyRate", hourlyRate);

  //     const totalHours = await this.calculateTotalHoursForMonth(
  //       userId,
  //       startDate,
  //       endDate
  //     );
  //     // console.log("Total Hour", totalHours);

  //     const totalPayroll = hourlyRate * totalHours;
  //     console.log(totalPayroll);

  //     return totalPayroll;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
}
module.exports = payRollHelper;
