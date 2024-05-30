const router = require("express").Router();
const {
  updateImage,
  getUpdatedImage,
} = require("../../controller/updateImageController");

router.post("/", updateImage);
router.post("/getUpdatedImage", getUpdatedImage);
module.exports = router;
