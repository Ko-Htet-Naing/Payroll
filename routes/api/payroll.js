const express = require("express");
const router = express.Router();
const payrollController = require("../../controller/payrollController");

router.get("/", payrollController.getPayrollForOneMonth);

module.exports = router;
