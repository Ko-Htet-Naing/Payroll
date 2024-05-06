const express = require("express");
const router = express.Router();
const attendanceController = require("../../controller/attendanceController");

router.post("/", attendanceController.createAttendance);

module.exports = router;
