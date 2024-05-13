const express = require("express");
const router = express.Router();
const leaveRecordController = require("../../controller/leaveRecordController");

router.post("/createLeave", leaveRecordController.createLeave);
router.get("/", leaveRecordController.getLeaveList);
router.put("/:id", leaveRecordController.updatedStatus);

module.exports = router;
