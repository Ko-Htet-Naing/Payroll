const { date } = require("date-fn");
const { Op, where } = require("sequelize");
const { LeaveRecord, Users, Department } = require("../models");
const LeaveRecordHelper = require("../helpers/LeaveRecordHelper");

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
      LeaveRecordHelper.decrementLeaveCount(leaveRecords);
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
  const status = req.query.status;

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

  try {
    const totalCount = await LeaveRecordHelper.getTotalLeaveCount();
    const totalPage = Math.ceil(totalCount / size);

    const leaveList = await LeaveRecordHelper.getLeaveList({
      page,
      size,
      username,
      from,
      to,
      status,
    });

    res.json({
      leaveList,
      totalPage,
      totalCount,
    });
  } catch (error) {
    console.error(error);
  }
};

// get leave record by userId
const getByUserId = async (req, res) => {
  const userId = req.params.UserId;

  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);
  const username = req.query.username;
  const from = req.query.fromDate;
  const to = req.query.toDate;
  const status = req.query.status;

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
  // Total Leave Record Count by userId

  try {
    const totalCount = await LeaveRecordHelper.getTotalLeaveCountByUserId(
      userId
    );
    const totalPage = Math.ceil(totalCount / size);

    const leaveListByUserId = await LeaveRecordHelper.getLeaveList({
      page,
      size,
      username,
      userId,
      from,
      to,
      status,
    });

    res.json({
      leaveListByUserId,
      totalPage,
      totalCount,
    });
  } catch (error) {
    console.error(error);
  }
};

// delete leave record by id
const deleteLeaveRecord = async (req, res) => {
  const { id } = req.params;
  const leaveRecord = await LeaveRecord.findByPk(id);
  if (!leaveRecord) {
    res.status(404).json({ messages: "Leave record not found" });
  }

  await leaveRecord.destroy({
    where: { status: "Pending" },
  });
  LeaveRecordHelper.incrementLeaveCount(leaveRecord);
  res.status(200).json("Deleted successfully");
};

// updated leave record by id

const updatedLeaveRecord = async (req, res) => {
  const { id } = req.params;

  //const leaveRecord = await LeaveRecord.findByPk(id);
  const { reasons, leaveType, from, to, attachmentUrl } = req.body;
  console.log(leaveType);

  await LeaveRecord.update(
    {
      reasons: reasons,
      leaveType: leaveType,
      from: from,
      to: to,
      attachmentUrl: attachmentUrl,
    },
    {
      where: { status: "Pending", id: id },
    }
  );

  res.status(200).json("updated successfully");
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

    leaveRecord.update({ status: status });
    if (leaveRecord.status === "Approved") {
      return res.status(200).json("Approved Successfully");
    }
    if (leaveRecord.status === "Rejected") {
      LeaveRecordHelper.incrementLeaveCount(leaveRecord);
    }

    res.status(200).json("Rejected successfully");
  } catch (error) {
    console.error(error);
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
