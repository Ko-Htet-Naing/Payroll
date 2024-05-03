const { Users } = require("../models");

const create = async (req, res) => {
  const {
    username,
    password,
    email,
    gender,
    role,
    position,
    employeeId,
    payroll,
    profileImage,
    dob,
    phoneNumber,
    address,
    annualLeave,
    mediacalLeave,
    nrc,
  } = req.body;
  const payload = {
    username: username || "staff",
    password: password || "staff@123",
    Email: email || "staff@gmail.com",
    Gender: gender || "male",
    Role: role || 5000,
    Position: position || "L1",
    EmployeeId: employeeId || 1111,
    Payroll: payroll || 40000,
    ProfileImage: profileImage || "imageUrl",
    DOB: dob || "12-2-2000",
    PhoneNumber: phoneNumber || 22222,
    Address: address || "Dawbon",
    AnnualLeave: annualLeave || 1,
    MedicalLeave: mediacalLeave || 1,
    NRC: nrc || "12/DPN(N)983829",
  };

  if (!payload) return res.status(200).send("Successful");

  await Users.create(payload);
  res.status(200).send("Created");
};

module.exports = { create };
