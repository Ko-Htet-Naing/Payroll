const express = require("express");
const authLocation = require("./routes/api/authLocation");
const User = require("./routes/api/User");
const testRoute = require("./routes/testRoute");
const createDepartment = require("./routes/api/createDepartment");
const cors = require("cors");

const attendance = require("./routes/api/attendance");
const db = require("./models");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// Routes API
app.use("/api/v1/mapCheck", authLocation);

// middleware

app.use("/api/v1/Users", User);
app.use("/api/v1/addDepartment", createDepartment);
app.use("/api/v1/attendance", attendance);

// Just for testing purpose
app.use("/api/v1/test", testRoute);
db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT : ", PORT);
  });
});
