const { Users, Department } = require("../models");
const jwt = require("jsonwebtoken");
const { comparePassword } = require("./Hash");

// login Section With JWT
const login = async (req, res) => {
  let { employeeId, password } = req.body;
  if (!employeeId || !password) {
    return res.status(404).send("employeeId or password missing");
  }
  const user = await Users.findOne({
    where: { EmployeeId: employeeId },
    raw: true,
  });

  if (!user) return res.status(404).send("User not found");
  const department = await Department.findByPk(user.DepartmentId);
  const dbComparePassword = await comparePassword(password, user.password);
  if (!dbComparePassword)
    return res.status(401).send({ message: "Wrong Password" });
  const dbEmployeeId = user.EmployeeId;
  const role = user.Role;
  // Token Creation
  const accessToken = jwt.sign(
    { UserInfo: { empId: dbEmployeeId, role: role } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "3h" }
  );
  const refreshTokenToStore = jwt.sign(
    {
      UserInfo: { empId: dbEmployeeId, role: role },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Update Refresh Token Data
  await Users.update(
    { CurrentAccessToken: accessToken, refreshToken: refreshTokenToStore },
    { where: { EmployeeId: dbEmployeeId } }
  );

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
    role,
    department: department?.deptName || "",
  };

  res.json({
    accessToken: accessToken,
    refreshToken: refreshTokenToStore,
    userData: dataToSendUser,
  });
};

module.exports = login;
