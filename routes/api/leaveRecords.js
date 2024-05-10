const express = require("express");
const router = express.Router();
const leaveRecordController = require("../../controller/leaveRecordController");
router.post("/createLeave", leaveRecordController.createLeave);
router.get("/", leaveRecordController.getLeaveList);
module.exports = router;
