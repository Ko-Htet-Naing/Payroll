const { LeaveRecord } = require("../models");
const LeaveRecordHelper = require("../helpers/LeaveRecordHelper");

const parseQueryParams = (req) => ({
  page: Math.max(0, Number.parseInt(req.query.page) || 0),
  size: Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10),
  username: req.query.username,
  from: req.query.fromDate,
  to: req.query.toDate,
  status: req.query.status,
  department: req.query.department,
  leaveType: req.query.leaveType,
  employeeId: req.query.employeeId,
});

const createLeave = async (req, res) => {
  const { reasons, leaveType, from, to, UserId } = req.body;
  const attachmentUrl = req.file ? req.file.url : null;

  const leaveRecords = {
    reasons: reasons || "illness",
    leaveType: leaveType || "Medical Leave",
    from: from || "2024-5-10",
    to: to || "2024-5-10",
    UserId: UserId || 1,
    attachmentUrl: "file from url" || null,
  };

  try {
    const existingLeave = await LeaveRecord.findOne({
      where: { UserId, from },
    });
    if (existingLeave) {
      return res.status(400).send("Leave record already exists");
    }
    await LeaveRecordHelper.decrementLeaveCount(leaveRecords);
    await LeaveRecord.create(leaveRecords);
    res.status(200).json("Leave created");
  } catch (error) {
    console.error("Error creating leave:", error);
    res.status(500).json({ message: "Error creating leave record" });
  }
};

const getLeaveList = async (req, res) => {
  const {
    page,
    size,
    username,
    from,
    to,
    status,
    department,
    leaveType,
    employeeId,
  } = parseQueryParams(req);

  try {
    const totalCount = await LeaveRecordHelper.getTotalLeaveCount();
    const leaveList = await LeaveRecordHelper.getLeaveList({
      page,
      size,
      username,
      from,
      to,
      status,
      department,
      leaveType,
      employeeId,
    });
    res.json({
      columns: [
        "username",
        "deptName",
        "position",
        "from",
        "to",
        "reason",
        "leaveType",
        "status",
        "employeeId",
      ].map((header) => ({ header, accessor: header })),
      datas: leaveList,
      totalPage: Math.ceil(totalCount / size),
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching leave list:", error);
    res.status(500).json({ message: "Error fetching leave list" });
  }
};

const getByUserId = async (req, res) => {
  const userId = req.params.UserId;
  const { page, size, from, to, status, leaveType, department } =
    parseQueryParams(req);

  try {
    const totalCount = await LeaveRecordHelper.getTotalLeaveCountByUserId(
      userId
    );
    const leaveListByUserId = await LeaveRecordHelper.getLeaveList({
      page,
      size,
      userId,
      from,
      to,
      status,
      department,
      leaveType,
    });
    res.json({
      columns: [
        "username",
        "deptName",
        "position",
        "from",
        "to",
        "reason",
        "leaveType",
        "status",
        "employeeId",
      ].map((header) => ({ header, accessor: header })),
      datas: leaveListByUserId,
      totalPage: Math.ceil(totalCount / size),
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching leave records by user ID:", error);
    res.status(500).json({ message: "Error fetching leave records" });
  }
};

const deleteLeaveRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const leaveRecord = await LeaveRecord.findByPk(id);
    if (!leaveRecord) {
      return res.status(404).json({ message: "Leave record not found" });
    }
    await leaveRecord.destroy();
    await LeaveRecordHelper.incrementLeaveCount(leaveRecord);
    res.status(200).json("Deleted successfully");
  } catch (error) {
    console.error("Error deleting leave record:", error);
    res.status(500).json({ message: "Error deleting leave record" });
  }
};

const updatedLeaveRecord = async (req, res) => {
  const { id } = req.params;
  const { reasons, leaveType, from, to, attachmentUrl } = req.body;

  try {
    const updateResult = await LeaveRecord.update(
      { reasons, leaveType, from, to, attachmentUrl },
      { where: { id, status: "Pending" } }
    );
    if (updateResult[0] === 0) {
      return res.status(404).json({
        message: "No record found to update or record is not pending",
      });
    }
    res.status(200).json("Updated successfully");
  } catch (error) {
    console.error("Error updating leave record:", error);
    res.status(500).json({ message: "Error updating leave record" });
  }
};

const updatedStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const leaveRecord = await LeaveRecord.findByPk(id);
    if (!leaveRecord) {
      return res.status(404).json({ message: "Leave record not found" });
    }
    await leaveRecord.update({ status: status });
    if (leaveRecord.status === "Approved") {
      res.status(200).json("Approved successfully");
    }
    if (leaveRecord.status === "Rejected") {
      await LeaveRecordHelper.incrementLeaveCount(leaveRecord);
      res.status(200).json("Rejected successfully");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Error updating status" });
  }
};

module.exports = {
  createLeave,
  getLeaveList,
  updatedStatus,
  getByUserId,
  deleteLeaveRecord,
  updatedLeaveRecord,
};
