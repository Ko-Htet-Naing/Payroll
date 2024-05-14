const { DATE } = require("sequelize");
const { LeaveRecord, Users, Department } = require("../models");
const moment = require("moment");
const createLeave = async (req, res) => {
  const { reasons, leaveType, from, to, UserId } = req.body;

  const leaveRecords = {
    reasons: reasons || "illness",
    leaveType: leaveType || "Medical Leave",
    from: from || "2024-5-10",
    to: to || "2024-5-10",
    UserId: UserId || 1,
  };

  await LeaveRecord.create(leaveRecords);
  res.status(201).json("Leave created");
};

const getLeaveList = async (req, res) => {
  // Total Leave Record Count

  const totalCount = await LeaveRecord.count();

  // get leave records
  const leaveList = await LeaveRecord.findAll({
    include: [
      {
        model: Users,
        attributes: ["username", "DepartmentId", "Position"],
        include: [{ model: Department, attributes: ["deptName"] }],
      },
    ],
  });

  res.status(200).json({ data: leaveList, totalCount });
};

// updated status
const updatedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leaveRecord = await LeaveRecord.findByPk(id);
    if (!leaveRecord) {
      return res.status(404).json({ message: "Leave record not found" });
    }

    const fromdate = leaveRecord.from;
    const todate = leaveRecord.to;
    console.log("from date", fromdate);
    console.log("to date", todate);

    console.log(isAfterThreeDays(fromdate));
    console.log("leave days", calculateLeaveDays(fromdate, todate));
    leaveRecord.status = status;
    console.log("leave status", leaveRecord.status);
    if (leaveRecord.status === "Approved") {
      console.log(leaveRecord.status === "Approved");
      if (leaveRecord.leaveType === "Medical Leave") {
        // medical leave ဖြစ်ရင်
        if (Users.MedicalLeave === 0) {
          // const users = await Users.findByPk(leaveRecord.UserId);
          // users.MedicalLeave -= 1;
          // await users.save();
          leaveRecord.status = "Pending";
          await leaveRecord.save();
          return res.status(400).json({
            message: "Do not have medical leave",
          });
        }
        const users = await Users.findByPk(leaveRecord.UserId);
        users.MedicalLeave -= 1;
        await users.save();
      } else if (leaveRecord.leaveType === "Annual Leave") {
        // annual leave ဖြစ်ရင်
        const leaveDays = calculateLeaveDays(fromdate, todate);
        const users = await Users.findByPk(leaveRecord.UserId);

        // 3ရက်  ကြိုပြီး leave တင်ရ မယ်
        if (!isAfterThreeDays(fromdate)) {
          leaveRecord.status = "Pending";
          await leaveRecord.save();
          return res.status(400).json({
            message:
              "Cannot apply annual leave, start date must be at least 3 days in the future",
          });
        }

        if (leaveDays > Users.AnnualLeave) {
          return res
            .status(400)
            .json({ message: "Insufficient annual leave balance" });
        }

        users.AnnualLeave -= leaveDays;
        await users.save();
      } else if (leaveRecord.leaveType === "Morning Leave") {
        if (Users.MedicalLeave > 0) {
          const users = await Users.findByPk(leaveRecord.UserId);
          users.MedicalLeave -= 0.5;
          await users.save();
        }
        leaveRecord.status = "Pending";
        await leaveRecord.save();
        return res.status(400).json({
          message: "Do not have medical leave",
        });
      } else {
        if (Users.MedicalLeave > 0) {
          const users = await Users.findByPk(leaveRecord.UserId);
          users.MedicalLeave -= 0.5;
          await users.save();
        }
        leaveRecord.status = "Pending";
        await leaveRecord.save();
        return res.status(400).json({
          message: "Do not have medical leave",
        });
      }
    }
    await leaveRecord.save();
    res.status(200).json(leaveRecord);
  } catch (error) {
    console.error(error);
  }
};

const isAfterThreeDays = (dateToCheck) => {
  const fromdate = moment(dateToCheck);
  // Calculate the date 3 days from now
  const threeDaysFromNow = moment().add(3, "days");
  // Check if the provided date is after 3 days from now
  const isAfter = fromdate.isAfter(threeDaysFromNow, "day");
  return isAfter;
};

const calculateLeaveDays = (fromDate, toDate) => {
  const start = moment(fromDate);
  const end = moment(toDate);

  // Calculate the difference in days
  const leaveDays = end.diff(start, "days") + 1; // Adding 1 to include both the start and end dates

  return leaveDays;
};
module.exports = { createLeave, getLeaveList, updatedStatus };
