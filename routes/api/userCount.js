const router = require("express").Router();
const userCountController = require("../../controller/userCountController");

router.get("/", userCountController.getUserCount);
router.get("/:id", userCountController.getLeaveCountByUserId);

module.exports = router;
