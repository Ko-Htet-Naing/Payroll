const router = require("express").Router();
const departmentController = require("../../controller/departmentController");

router.post("/", departmentController.create);

module.exports = router;
