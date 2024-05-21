const express = require("express");
const router = express.Router();
const authLocationController = require("../../controller/locationController");

router.post("/", authLocationController.locationAuth);
module.exports = router;
