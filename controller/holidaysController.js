//const LeaveHelper = require("../helpers/LeaveHelper");
const addHolidays = (req, res) => {
  const { dates } = req.body;
  if (dates == undefined || dates?.length == 0)
    return res.status(400).send("Credential Missing");

  if (!holiday_name || !from || !to)
    return res.status(400).send("Credential Missing");
  //LeaveHelper.checkFromToDate(from, to);
};
module.exports = { addHolidays };
