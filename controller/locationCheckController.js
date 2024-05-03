const haversine = require("haversine");

let locationRange = 70;

const start = {
  latitude: 16.816512365626778,
  longitude: 96.12863369856154,
};

const end = {
  latitude: 16.817051150808854,
  longitude: 96.12902680357375,
};
// Set Range by HR
const setlocationAuth = (req, res) => {
  const range = req.body;
  if (!range) return res.sendStatus(404);
  locationRange = range;
  console.log(locationRange);
};

const locationAuth = (req, res) => {
  const location = req.body;
  if (!location) return res.status(404).send("Locations Not Found");
  console.log(
    haversine(start, end, { threshold: locationRange, unit: "meter" })
  );
};

module.exports = {
  locationAuth,
  setlocationAuth,
};
