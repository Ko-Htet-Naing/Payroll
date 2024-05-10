const router = require("express").Router();
const path = require("path");
const testController = require("../controller/testController");

router.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "..", "views", "Login.html"));
});
router.get("/getAll", testController);

module.exports = router;
