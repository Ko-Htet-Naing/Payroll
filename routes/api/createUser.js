const router = require("express").Router();
const createUser = require("../../controller/userController");
router.post("/", createUser.create);

module.exports = router;
