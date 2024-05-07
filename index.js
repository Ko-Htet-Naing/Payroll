const express = require("express");
const authLocation = require("./routes/api/authLocation");
const User = require("./routes/api/User");
const createDepartment = require("./routes/api/createDepartment");

const attendance = require("./routes/api/attendance");
const db = require("./models");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes API
app.use("/api/v1/mapCheck", authLocation);

// middleware

app.use("/api/v1/Users", User);
app.use("/api/v1/addDepartment", createDepartment);
app.use("/api/v1/attendance", attendance);

db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT : ", PORT);
  });
});
