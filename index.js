const express = require("express");
const authLocation = require("./routes/api/authLocation");
const createUser = require("./routes/api/createUser");
const db = require("./models");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded());

// Routes API
app.use("/api/v1/mapCheck", authLocation);

// middleware

app.use("/api/v1/createUser", createUser);

db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT : ", PORT);
  });
});
