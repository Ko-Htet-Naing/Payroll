const router = require("express").Router();
const { addHolidays } = require("../../controller/holidaysController");

router.post("/add", addHolidays);
module.exports = router;
