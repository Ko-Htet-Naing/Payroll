const HolidayHelper = require("../helpers/HolidayHelper");
const addHolidays = (req, res) => {
  const { dates } = req.body;
  if (dates == undefined || dates?.length == 0)
    return res.status(400).send("Credential Missing");

  HolidayHelper.iterateEachItemAndSetToDB(dates);
  console.log(dates);
};
module.exports = { addHolidays };
