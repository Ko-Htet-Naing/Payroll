const express = require("express");
const router = express.Router();
const payrollController = require("../../controller/payrollController");

// router.get("/", payrollController.getPayrollForThisMonth);
// router.get("/prev", payrollController.getPayrollForPrevMonth);
router.get("/:id", payrollController.getPayrollByUserId);

module.exports = router;
