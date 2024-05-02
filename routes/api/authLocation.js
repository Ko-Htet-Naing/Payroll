const { Router } = require("express");
const locationCheckController = require("../../controller/locationCheckController");

const router = Router();

router.post("/", locationCheckController.locationAuth);

module.exports = router;
