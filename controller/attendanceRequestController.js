const { Attendance_Record } = require("../models");

// create attendance request
const createAttendanceRequest = async (req, res) => {
  const { reason, date, UserId } = req.body;
  const attendaceRequest = {
    reason: reason || "late",
    date: date || "2024-5-13",
    UserId: UserId || 3,
  };

  await Attendance_Record.create(attendaceRequest);
  res.status(200).json(attendaceRequest);
};

// get all attendance request
const getAttendanceRequest = async (req, res) => {
  const listOfRequest = await Attendance_Record.findAll();
  if (!listOfRequest) res.status(404).json("Attendance request list not found");
  res.status(200).json(listOfRequest);
};

// update status
const updatedStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const attendanceRequest = await Attendance_Record.findByPk(id);
  if (!attendanceRequest) res.status(404).json("Attendance request not found");
  attendanceRequest.status = status;
  await attendanceRequest.save();
  res.status(200).json(attendanceRequest);
};
module.exports = {
  createAttendanceRequest,
  getAttendanceRequest,
  updatedStatus,
};
