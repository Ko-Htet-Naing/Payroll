const { where } = require("sequelize");
const { Attendance_Record, Attendance, Users } = require("../models");

// create attendance request
const createAttendanceRequest = async (req, res) => {
  const { reason, date, UserId } = req.body;
  const attendanceRequest = {
    reason: reason || "late",
    date: date || "2024-5-13",
    UserId: UserId || 3,
  };

  if (!attendanceRequest) {
    res.status(404).json({ messages: "attendance request not found" });
  } else {
    const existingAttendanceRequest = await Attendance_Record.findOne({
      where: { UserId: UserId, date: date },
    });
    if (!existingAttendanceRequest) {
      await Attendance_Record.create(attendanceRequest);
      res.status(200).json("attendaneRequest created");
    } else {
      res.status(400).json({ message: "Your already have attendance request" });
    }
  }
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
};

module.exports = {
  createAttendanceRequest,
  getAttendanceRequest,
  updatedStatus,
};
