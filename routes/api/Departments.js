const router = require("express").Router();
const departmentController = require("../../controller/departmentController");

router.post("/", departmentController.create);
router.get("/", departmentController.getAllData);

module.exports = router;
