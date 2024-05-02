const locationAuth = (req, res) => {
  const location = req.body;
  if (!location) return res.status(404).send("Locations Not Found");
  res.status(200).send(location);
};

module.exports = {
  locationAuth,
};
