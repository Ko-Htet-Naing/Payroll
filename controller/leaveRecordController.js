const { LeaveRecord, Users } = require("../models");
const LeaveRecordHelper = require("../helpers/LeaveRecordHelper");
const createNewLeaveHelper = require("../helpers/createNewLeaveHelper");

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
  position: req.query.position,
});

const createLeave = async (req, res) => {
  const { reasons, leaveType, from, to, UserId, attachmentUrl } = req.body;

  const leaveRecords = {
    reasons: reasons || "illness",
    leaveType: leaveType || "Medical Leave",
    from: from || "2024-5-10",
    to: to || "2024-5-10",
    UserId: UserId || 1,
    attachmentUrl: attachmentUrl || "File From URL",
  };

  const result = await createNewLeaveHelper.createNewLeaveRequest(leaveRecords);
  const user = await Users.findByPk(leaveRecords.UserId);
  result.success
    ? res.status(200).send({
        message: result.message,
        medical: user.MedicalLeave,
        annual: user.AnnualLeave,
      })
    : res.status(400).send({ message: result.message });
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
    position,
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
      position,
    });
    if (!leaveList.length > 0)
      return res.status(404).json("Leave record not found");
    res.status(200).json({
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

// leave ယူတဲ့ တယောက်ချင်းစီရဲ့ record
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
    if (!leaveListByUserId > 0)
      return res.status(404).json({ message: "leave record not found" });
    res.status(200).json({
      columns: [
        "username",
        "departmentName",
        "position",
        "from",
        "to",
        "reason",
        "leaveType",
        "status",
        "employeeId",
        "attachmentUrl",
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
    const leaveRecord = await LeaveRecord.findOne({
      where: { id: id, status: "Pending" },
    });

    if (!leaveRecord) {
      return res.status(404).json({ message: "Leave record not found" });
    }
    await LeaveRecordHelper.incrementLeaveCount(leaveRecord);
    await leaveRecord.destroy();

    const user = await Users.findByPk(leaveRecord.UserId);

    res.status(200).json({
      message: "Deleted successfully",
      medical: user.MedicalLeave,
      annual: user.AnnualLeave,
    });
  } catch (error) {
    console.error("Error deleting leave record:", error);
    res.status(500).json({ message: "Error deleting leave record" });
  }
};

const updatedLeaveRecord = async (req, res) => {
  const { id } = req.params;
  const { reasons, leaveType, from, to, attachmentUrl } = req.body;

  try {
    const leaveRecord = await LeaveRecord.findByPk(id);

    await LeaveRecordHelper.incrementLeaveCount(leaveRecord);

    const updatedLeave = await leaveRecord.update(
      { reasons, leaveType, from, to, attachmentUrl },
      { where: { status: "Pending" } }
    );

    await LeaveRecordHelper.decrementLeaveCount(leaveRecord);
    const user = await Users.findByPk(updatedLeave.UserId);
    res.status(200).json({
      message: updatedLeave,
      medical: user.MedicalLeave,
      annual: user.AnnualLeave,
    });
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
    const updateStatus = await leaveRecord.update({ status: status });

    if (leaveRecord.status === "Approved") {
      res.status(200).json("Approved successfully");
    }
    if (leaveRecord.status === "Rejected") {
      await LeaveRecordHelper.incrementLeaveCount(leaveRecord);
      const user = await Users.findByPk(updateStatus.UserId);
      res.status(200).json({
        message: "Rejected successfully",
        medical: user.MedicalLeave,
        annual: user.AnnualLeave,
      });
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
