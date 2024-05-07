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
};

const locationAuth = (req, res) => {
  const { Lat, Lon } = req.body;
  if (!Lat && !Lon) return res.status(404).send("Locations Not Found");
  const isValid = haversine(Lat, Lon, {
    threshold: locationRange,
    unit: "meter",
  });

  res.status(200).send({ Status: isValid });
};

module.exports = {
  locationAuth,
  setlocationAuth,
};
