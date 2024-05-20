const { Attendance_Record, Attendance } = require("../models");
const UserHelper = require("../helpers/DBHelper");

// create attendance request
const createAttendanceRequest = async (req, res) => {
  const { reason, date, UserId } = req.body;
  if (!reason || !date || !UserId)
    return res.status(404).send("Credential Missing!");
  // const attendaceRequest = {
  //   reason: reason || "in_time_late", // "out_time_late"
  //   date: date || "2024-5-13",
  //   UserId: UserId || 3,
  //};
  if (await UserHelper.checkUserInAttendanceDB(UserId)) {
    if (UserHelper.findUserAttendanceLeaveCount(UserId)) {
      const result = await UserHelper.findAndReplace(UserId, reason, date);
      res.status(200).send("Operation Success");
    } else {
      res.status(401).send("Operation Unsuccessful");
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

  // const attendanceRequest = await Attendance_Record.findByPk(id);
  // if (!attendanceRequest) res.status(404).json("Attendance request not found");
  // attendanceRequest.status = status;
};

module.exports = {
  createAttendanceRequest,
  getAttendanceRequest,
  updatedStatus,
};
