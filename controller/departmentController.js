const { eachHourOfInterval } = require("date-fns");
const { Department } = require("../models");

const create = async (req, res) => {
  const { deptName } = req.body;
  if (!deptName) return res.status(404).send("Data Not Found");
  try {
    await Department.create({ deptName });
    res.status(200).send("Created");
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({ message: "Department name already exists." });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
const getAllData = async (req, res) => {
  const data = await Department.findAll();
  if (!data) return res.status(404).send("No Data Was found in database");
  res.status(200).json({ data });
};
module.exports = { create, getAllData };
