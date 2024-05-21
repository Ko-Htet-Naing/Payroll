const { Attendance, LeaveRecord, Users } = require("../models");
const { Op } = require("sequelize");

class payRollHelper {
  static countWeekends(year, month) {
    let count = 0;
    let date = new Date(year, month, 1);

    while (date.getMonth() === month) {
      if (date.getDay() === 0 || date.getDay() === 6) {
        count++;
      }
      date.setDate(date.getDate() + 1);
    }

    return count;
  }

  static async calculateTotalHoursForMonth(userId, startDate, endDate) {
    try {
      // Query attendance records for the month
      const attendanceRecords = await Attendance.findAll({
        where: {
          UserId: userId,
          date: { [Op.between]: [startDate, endDate] }, // Filter records for the current month
        },
      });

      // console.log("attendanceRecords", attendanceRecords);

      // Query leave records for the month with status "approved"
      const leaveRecords = await LeaveRecord.findAll({
        where: {
          UserId: userId,
          status: "Approved",
          from: { [Op.between]: [startDate, endDate] }, // Filter records for the current month
          to: { [Op.between]: [startDate, endDate] },
        },
      });
      //console.log("leave records", leaveRecords);

      // Calculate total hours worked by summing up the hours from attendance records
      let totalHoursWorked = 0;
      //console.log(totalHoursWorked);

      attendanceRecords.forEach((record) => {
        if (record.in_time !== null && record.out_time !== null) {
          console.log(`Processing attendance record: ${record.date}`);

          const actualInTime = new Date(`${record.date}T${record.in_time}`);
          const actualOutTime = new Date(`${record.date}T${record.out_time}`);

          // Adjust in_time and out_time to 08:30 and 16:30 respectively if within range
          const startOfWorkDay = new Date(`${record.date}T08:30:00`);
          const endOfWorkDay = new Date(`${record.date}T16:30:00`);

          const inTime =
            actualInTime < startOfWorkDay ? startOfWorkDay : actualInTime;
          const outTime =
            actualOutTime >= endOfWorkDay ? endOfWorkDay : actualOutTime;

          let hoursWorked = (outTime - inTime) / (1000 * 60 * 60); // Convert milliseconds to hours

          if (record.late_in_time) {
            hoursWorked -= record.late_in_time / 60;
          }

          if (record.early_out_time) {
            hoursWorked -= record.early_out_time / 60;
          }
          // console.log(
          //   `In Time: ${inTime}, Out Time: ${outTime}, Hours Worked: ${hoursWorked}`
          // );

          totalHoursWorked += hoursWorked;
        }
      });

      leaveRecords.forEach((leave) => {
        const leaveStart = new Date(leave.from);
        const leaveEnd = new Date(leave.to);
        const leaveDays =
          Math.floor((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1; // inclusive of both start and end
        console.log(leaveDays);

        if (
          leaveRecords.status === "Medical Leave" ||
          leaveRecords.status === "Annual Leave"
        ) {
          totalHoursWorked += leaveDays * 8;
        } else {
          totalHoursWorked += leaveDays * 4;
        }
      });
      return totalHoursWorked;
    } catch (error) {
      console.error(error);
    }
  }

  static async calculatePayroll(userId, startDate, endDate, year, month) {
    try {
      const users = await Users.findAll({ where: { id: userId } });

      const user = users[0];
      const monthlySalary = user.Salary;
      console.log("monthlysalary", monthlySalary);
      const totalDays = endDate.getDate();
      const workHourPerDay = 8;

      console.log("count weekend", this.countWeekends(year, month));

      const totalRate =
        (totalDays - this.countWeekends(year, month)) * workHourPerDay;
      console.log("totalRate", totalRate);

      console.log("totalDays", totalDays);

      const hourlyRate = monthlySalary / totalRate;

      console.log("hourlyRate", hourlyRate);

      const totalHours = await this.calculateTotalHoursForMonth(
        userId,
        startDate,
        endDate
      );
      console.log("Total Hour", totalHours);

      const totalPayroll = hourlyRate * totalHours;
      console.log(totalPayroll);

      return totalPayroll;
    } catch (error) {
      console.error(error);
    }
  }
}
module.exports = payRollHelper;
