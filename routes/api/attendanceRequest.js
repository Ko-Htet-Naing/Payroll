const express = require("express");
const router = express.Router();
const attendanceRequestController = require("../../controller/attendanceRequestController");

router.post(
  "/createRequest",
  attendanceRequestController.createAttendanceRequest
);
router.get("/", attendanceRequestController.getAttendanceRequest);
router.patch("/:id", attendanceRequestController.updatedStatus);
module.exports = router;
