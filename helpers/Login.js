const { Users } = require("../models");
const jwt = require("jsonwebtoken");
const { comparePassword } = require("./Hash");
const { refreshToken } = require("firebase-admin/app");

// login Section With JWT
const login = async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(404).send("Username and Password Not Found");
  }
  const user = await Users.findOne({
    where: { username: username },
  });
  if (!user) return res.status(404).send("User not found");
  const dbComparePassword = await comparePassword(password, user.password);
  if (!dbComparePassword)
    return res.status(401).send({ message: "Wrong Password" });
  const dbUsername = user.username;
  const role = user.Role;

  // Token Creation
  const accessToken = jwt.sign(
    { UserInfo: { username: dbUsername, role: role } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1m" }
  );
  const refreshTokenToStore = jwt.sign(
    {
      UserInfo: { username: dbUsername },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  // Update Refresh Token Data
  await Users.update(
    { refreshToken: refreshTokenToStore },
    { where: { username: dbUsername } }
  );

  //Setting cookie
  res.cookie("jwt_ref", refreshTokenToStore, {
    secure: false, // Set to true for HTTPS
    sameSite: "None",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  // user ကို ပြန်ပို့မယ့် data
  const dataToSendUser = {
    userId: user.id,
    username: user.username,
    email: user.Email,
    employeeId: user.EmployeeId,
    phoneNumber: user.PhoneNumber,
    address: user.Address,
    DOB: user.DOB,
    profileImage: user.ProfileImage,
    annualLeave: user.AnnualLeave,
    medicalLeave: user.MedicalLeave,
    attendanceLeave: user.AttendanceLeave,
    NRC: user.NRC,
  };

  res.json({
    token: accessToken,
    userData: dataToSendUser,
  });
};

module.exports = login;
