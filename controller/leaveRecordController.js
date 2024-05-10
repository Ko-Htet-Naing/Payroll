const { LeaveRecord, Users, Department } = require("../models");
const createLeave = async (req, res) => {
  const { reasons, leaveType, from, to, UserId } = req.body;

  const leaveRecords = {
    reasons: reasons || "illness",
    leaveType: leaveType || "Medical Leave",
    from: from || "2024-5-7",
    to: to || "2024-5-8",
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

module.exports = { createLeave, getLeaveList };
