const router = require("express").Router();
const userCountController = require("../../controller/userCountController");

router.get("/", userCountController.getUserCount);

module.exports = router;
