const { Router } = require("express");
const router = Router();
const path = require("path");

router.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "..", "views", "Login.html"));
});

module.exports = router;
