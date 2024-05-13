const { DATE } = require("sequelize");
const { LeaveRecord, Users, Department } = require("../models");
const createLeave = async (req, res) => {
  const { reasons, leaveType, from, to, UserId } = req.body;

  const leaveRecords = {
    reasons: reasons || "illness",
    leaveType: leaveType || "Medical Leave",
    from: from || "2024-5-1",
    to: to || "2024-5-8",
    UserId: UserId || 1,
  };

  const fromdate = new Date(from);
  const todate = new Date(to);

  // Calculate the difference in milliseconds
  const differenceMs = todate.getTime() - fromdate.getTime();

  // Convert milliseconds to days
  const leaveDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  console.log("Leave days", leaveDays + 1);

  await LeaveRecord.create(leaveRecords);
  res.status(201).json("Leave created", { leaveDays: leaveDays });
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

    leaveRecord.status = status;
    await leaveRecord.save();
    res.status(200).json(leaveRecord);
  } catch (error) {
    console.error(error);
  }
};
module.exports = { createLeave, getLeaveList, updatedStatus };
