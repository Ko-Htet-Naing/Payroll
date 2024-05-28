const router = require("express").Router();
const { updateImage } = require("../../controller/updateImageController");

router.post("/", updateImage);
module.exports = router;
