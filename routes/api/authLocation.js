const { Router } = require("express");
const locationCheckController = require("../../controller/locationCheckController");

const router = Router();

router.post("/", locationCheckController.locationAuth);
router.post("/setRange", locationCheckController.setlocationAuth);

module.exports = router;
