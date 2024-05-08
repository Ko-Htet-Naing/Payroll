const { Users, Department } = require("../models");

Users.addHook("afterCreate", async (user, options) => {
  console.log("I am in after Create");
  const departmentId = user.DepartmentId;
  console.log(departmentId);
  if (departmentId) {
    const userCount = await Users.count({
      where: { DepartmentId: departmentId },
    });
    await Department.update(
      { totalCount: userCount },
      { where: { id: departmentId } }
    );
  }
});
Users.addHook("afterDestroy", async (deletedUser, options) => {
  console.log("I am in after Destroy");
  const departmentId = deletedUser.DepartmentId;
  if (departmentId) {
    const userCount = await Users.count({
      where: { DepartmentId: departmentId },
    });
    await Department.update(
      { totalCount: userCount },
      { where: { id: departmentId } }
    );
  }
});

// staff deleting
const deleteStaff = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(404).send("Id not found");
  const user = await Users.findByPk(id);
  if (!user) return res.status(404).send("User not found");
  await user.destroy();
  res.status(200).send("Delete Successfully!");
};

// Staff creating
const createStaff = async (req, res) => {
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
    departmentId,
  } = req.body;
  const userData = {
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
    DepartmentId: departmentId || 3,
  };

  await Users.create(userData);
  res.status(200).send("Successfully Created");
};

const getUserList = async (req, res) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);

  let page = 0;
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    page = pageAsNumber;
  }

  // show 10 attendances
  let size = 10;
  if (
    !Number.isNaN(sizeAsNumber) &&
    !(sizeAsNumber > 10) &&
    !(sizeAsNumber < 1)
  ) {
    size = sizeAsNumber;
  }

  userWithCount = await Users.findAndCountAll({
    limit: size,
    offset: page * size,
  });

  res.send({
    // attendance: attendanceWithCount,
    content: userWithCount.rows,
    totalPages: Math.ceil(userWithCount.count / Number.parseInt(size)),
  });
};
module.exports = { createStaff, deleteStaff, getUserList };
