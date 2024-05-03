const { Department } = require("../models");

const create = async (req, res) => {
  const payload = req.body;
  if (!payload) return res.status(404).send("Data Not Found");
  await Department.create(payload);
  res.status(200).send("Created");
};
module.exports = { create };
