const router = require("express").Router();
const createStaff = require("../../controller/userController");
router.post("/createUser", createStaff.createStaff);
router.delete("/deleteUser/:id", createStaff.deleteStaff);

module.exports = router;
