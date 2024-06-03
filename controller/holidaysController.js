//const LeaveHelper = require("../helpers/LeaveHelper");
const addHolidays = (req, res) => {
  const { holiday_name, from, to } = req.body;

  if (!holiday_name || !from || !to)
    return res.status(400).send("Credential Missing");
  //LeaveHelper.checkFromToDate(from, to);
};
module.exports = { addHolidays };
