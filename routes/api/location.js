const Router = require("express").Router();
const { location } = require("../../models");

Router.get("/getLoc", async function (req, res) {
  try {
    const locationData = await location.findAll({
      attributes: ["lat", "lon", "range"],
    });
    if (!locationData)
      return res.status(500).json({ message: "Internal Server Error" });
    res.status(200).json({ location: locationData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
Router.post("/setLoc", async function (req, res) {
  const { lat, lon, range } = req.body;
  if (!lat || !lon || !range)
    return res.status(404).json({ message: "lat, lon and range missing" });

  const payload = {
    lat: lat,
    lon: lon,
    range: range,
  };
  try {
    const existingLocation = await location.findOne({ where: payload });
    if (!existingLocation) {
      await location.create(payload);
    }
    const isSuccess = await location.update(payload, { where: {} });
    console.log("Is success ", isSuccess);
    return res.status(200).json({ message: "Successfully Set" });
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = Router;
