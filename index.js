const express = require("express");
const authlocation = require("./routes/api/authLocation");
const user = require("./routes/api/Users");
const testRoute = require("./routes/testRoute");
const department = require("./routes/api/Departments");
const handleRefresh = require("./routes/api/refresh");
const cors = require("cors");
const corsOptions = require("./config/allowOrigin");
const cookieParser = require("cookie-parser");
const userCount = require("./routes/api/userCount");
const verifyJWT = require("./middleware/verifyJWT");

const attendance = require("./routes/api/attendance");
const leaveRecord = require("./routes/api/leaveRecords");
const attendanceRequest = require("./routes/api/attendanceRequest");
const payrollthisMonth = require("./routes/api/payroll");

const swaggerDocs = require("./utils/swagger");

const db = require("./models");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes API
app.use("/api/v1/mapCheck", authlocation);
// middleware
app.use("/api/v1/users", user);
app.use("/api/v1/departments", department);
app.use("/api/v1/attendance", attendance);
app.use("/api/v1/leaveRecord", leaveRecord);
app.use("/api/v1/attendanceRequest", attendanceRequest);
app.use("/api/v1/userCount", userCount);
app.use("/api/v1/payroll", payrollthisMonth);
// For Regenerating Access Token
app.use("/api/v1/refresh", handleRefresh);

// Just for testing purpose
// app.use(verifyJWT);
app.use("/api/v1/test", testRoute);

// For handling unknown request
app.all((req, res) => {
  res.status(404).send(path.join(__dirname, "views", "404.html"));
});
db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT : ", PORT);
    swaggerDocs(app, PORT);
  });
});
