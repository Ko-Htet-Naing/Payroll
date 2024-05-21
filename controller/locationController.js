const haversine = require("haversine");

let locationRange = 1000;
let isValid = null;

// Set Range by HR
const setlocationAuth = (req, res) => {
  const range = req.body;
  if (!range) return res.sendStatus(404);
  locationRange = range;
};

// Location Auth
const locationAuth = (req, res) => {
  const { lat, lon } = req.body;
  if (!lat && !lon) return res.status(404).send("Lat or Lon Missing");
  const start = {
    latitude: lat || 16.81709781404742,
    longitude: lon || 96.12951985255191,
  };

  const end = {
    latitude: 16.81669722489963,
    longitude: 96.12860150837099,
  };

  isValid = haversine(start, end, {
    threshold: locationRange,
    unit: "meter",
  });
  res.status(200).json({ isValid: isValid });
};

module.exports = { locationAuth };
