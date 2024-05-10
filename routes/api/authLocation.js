const router = require("express").Router();
const locationController = require("../../controller/locationController");

router.post("/sendDateTime", locationController.getAuthenticateDateAndTime);
router.post("/", locationController.locationAuth);
router.post("/setRange", locationController.setlocationAuth);
module.exports = router;
