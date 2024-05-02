const express = require("express");
const authLocation = require("./routes/api/authLocation");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded());

// Routes API
app.use("/api/v1/mapCheck", authLocation);

app.listen(PORT, () => {
  console.log("Server is running on PORT : ", PORT);
});
