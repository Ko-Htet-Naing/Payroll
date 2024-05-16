const { date } = require("date-fn");
const { Op } = require("sequelize");
const { LeaveRecord, Users, Department } = require("../models");
const moment = require("moment");
const createLeave = async (req, res) => {
  const { reasons, leaveType, from, to, UserId } = req.body;
  const attachmentFile = req.file;

  const leaveRecords = {
    reasons: reasons || "illness",
    leaveType: leaveType || "Medical Leave",
    from: from || "2024-5-10",
    to: to || "2024-5-10",
    UserId: UserId || 1,
    attachmentUrl: "file from url" || null,
  };

  if (!leaveRecords) {
    res.status(404).json({ messages: "leave record not found" });
  } else {
    const existingLeave = await LeaveRecord.findOne({
      where: { UserId: UserId, from: from },
    });
    if (!existingLeave) {
      await LeaveRecord.create(leaveRecords);
      res.status(200).json("Leave created");
    } else {
      res.status(400).json({ message: "Your already have leave for today" });
    }
  }
};

const getLeaveList = async (req, res) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);
  const username = req.query.username;
  const from = req.query.fromDate;
  const to = req.query.toDate;

  // pagination
  let page = 0;
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    page = pageAsNumber;
  }

  // show 10 attendances
  let size = 10;
  if (
    !Number.isNaN(sizeAsNumber) &&
    !(sizeAsNumber > 10) &&
    !(sizeAsNumber < 1)
  ) {
    size = sizeAsNumber;
  }
  // Total Leave Record Count

  const totalCount = await LeaveRecord.count();
  const totalPage = Math.ceil(totalCount / size);

  try {
    let whereClause = {};
    let whereUsername = {};

    if (from && to) {
      whereClause.from = { [Op.between]: [from, to] };
      whereClause.to = { [Op.between]: [from, to] };
    }
    if (username) {
      whereUsername.username = {
        [Op.like]: `%${username}%`,
      };
    }
    const leaveList = await LeaveRecord.findAll({
      where: whereClause,
      include: [
        {
          model: Users,
          where: whereUsername,
          attributes: ["username", "DepartmentId", "Position"],
          include: [{ model: Department, attributes: ["deptName"] }],
        },
      ],
      limit: size,
      offset: page * size,
    });

    if (!leaveList)
      return res.status(404).json({ message: "leave list not found" });

    res.status(200).json({ data: leaveList, totalCount, totalPage });
  } catch (error) {
    console.error(error);
  }
};

// get leave records

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
      if (leaveRecord.leaveType === "Medical Leave") {
        const users = await Users.findByPk(leaveRecord.UserId);
        // medical leave ဖြစ်ရင်
        if (users.MedicalLeave === 0) {
          leaveRecord.status = "Pending";
          await leaveRecord.save();
          return res.status(400).json({
            message: "Do not have medical leave",
          });
        } else {
          users.MedicalLeave -= 1;
          await users.save();
        }
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

        if (leaveDays > users.AnnualLeave) {
          return res
            .status(400)
            .json({ message: "Insufficient annual leave balance" });
        }

        users.AnnualLeave -= leaveDays;
        await users.save();
      } else if (leaveRecord.leaveType === "Morning Leave") {
        const users = await Users.findByPk(leaveRecord.UserId);
        if (users.MedicalLeave === 0) {
          leaveRecord.status = "Pending";
          await leaveRecord.save();
          return res.status(400).json({
            message: "Do not have medical leave",
          });
        } else {
          users.MedicalLeave -= 0.5;
          await users.save();
        }
      } else if (leaveRecord.leaveType === "Evening Leave") {
        const users = await Users.findByPk(leaveRecord.UserId);
        if (users.MedicalLeave === 0) {
          leaveRecord.status = "Pending";
          await leaveRecord.save();
          return res.status(400).json({
            message: "Do not have medical leave",
          });
        } else {
          users.MedicalLeave -= 0.5;
          await users.save();
        }
      }
    } else if (leaveRecord.status === "Rejected") {
      // await leaveRecord.save();
      res.status(400).json({ message: "Cannot request for leave" });
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
