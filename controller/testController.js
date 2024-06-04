const { getUsernameFromDB } = require("../helpers/DBHelper.js");
const getAllAttendance = async (req, res) => {
  console.log(await getUsernameFromDB(11));
};
getAllAttendance();
module.exports = getAllAttendance;
