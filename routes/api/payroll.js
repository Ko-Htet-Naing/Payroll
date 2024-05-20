const express = require("express");
const router = express.Router();
const payrollController = require("../../controller/payrollController");

router.get("/", payrollController.getPayrollForThisMonth);

module.exports = router;
