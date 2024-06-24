const express = require("express");

const swaggerDocs = require("./utils/swagger");
const authlocation = require("./routes/api/authLocation");
const user = require("./routes/api/Users");
const testRoute = require("./routes/testRoute");
const department = require("./routes/api/Departments");
const handleRefresh = require("./routes/api/refresh");
const cors = require("cors");
const corsOptions = require("./config/allowOrigin");
const cookieParser = require("cookie-parser");
const userCount = require("./routes/api/userCount");

// Auth လုပ်ချိန်တွင်
const verifyJWT = require("./middleware/verifyJWT");
const attendance = require("./routes/api/attendance");
const leaveRecord = require("./routes/api/leaveRecords");
const attendanceRequest = require("./routes/api/attendanceRequest");
const payroll = require("./routes/api/payroll");
const holidays = require("./routes/api/holidays");
const profileImage = require("./routes/api/profileImage");
const fcm = require("./routes/api/fcm");
const location = require("./routes/api/location");
const login = require("./routes/api/login");

const db = require("./models");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Default value resetter
require("./config/scheduler");

// Swagger documentation
swaggerDocs(app, PORT);

app.use("/api/v1/login", login);
app.use("/api/v1/refresh", handleRefresh);

app.use(verifyJWT);

// Swagger documentation
swaggerDocs(app, PORT);

app.use("/api/v1/users", user);

// Routes API
app.use("/api/v1/mapCheck", authlocation);
// middleware
app.use("/api/v1/departments", department);

app.use("/api/v1/leaveRecord", leaveRecord);
app.use("/api/v1/attendanceRequest", attendanceRequest);
app.use("/api/v1/userCount", userCount);
app.use("/api/v1/payroll", payroll);
app.use("/api/v1/holidays", holidays);
// send location data
app.use("/api/v1/location", location);
// send FCM Token to backend from mobile api
app.use("/api/v1/fcm", fcm);
app.use("/api/v1/updateProfileImage", profileImage);
// For Regenerating Access Token

app.use("/api/v1/attendance", attendance);
// Testing route for jwt
app.use("/api/v1/test", testRoute);

// For handling unknown request
app.all((req, res) => {
  res.status(404).send(path.join(__dirname, "views", "404.html"));
});
db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT : ", PORT);
  });
});
