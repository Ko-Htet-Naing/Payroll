const { Department } = require("../models");

const create = async (req, res) => {
  const payload = req.body.deptName;
  if (!payload) return res.status(404).send("Data Not Found");

  const existingDeptName = await Department.findOne({
    where: { deptName: payload },
  });
  if (existingDeptName)
    return res.status(400).send("department name already exists");
  await Department.create(payload);
  res.status(200).send("Created");
};
const getAllData = async (req, res) => {
  const data = await Department.findAll();
  if (!data) return res.status(404).send("No Data Was found in database");
  res.status(200).json({ data });
};
module.exports = { create, getAllData };
