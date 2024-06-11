const { Users, Department, Payroll } = require("../models");

const { hashPassword, comparePassword } = require("../helpers/Hash");
const { Op } = require("sequelize");

require("dotenv").config();

// Hook to synchronize user after user are inserted
Users.addHook("afterCreate", async (user, options) => {
  await Payroll.create({ UserId: user.id });
  const departmentId = user.DepartmentId;

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

// Hook to synchronize after delete user
Users.addHook("afterDestroy", async (deletedUser, options) => {
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
  res.status(200).json({ message: "Delete Successfully!" });
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
    salary,
    dob,
    phoneNumber,
    address,
    annualLeave,
    medicalLeave,
    attendanceLeave,
    nrc,
    departmentId,
  } = req.body;
  const profileImage = req.file;

  // Check data exists
  // if (
  //   !username ||
  //   !password ||
  //   !email ||
  //   !gender ||
  //   !role ||
  //   !position ||
  //   !employeeId ||
  //   !payroll ||
  //   !dob ||
  //   !phoneNumber ||
  //   !address ||
  //   !annualLeave ||
  //   !mediacalLeave ||
  //   !nrc ||
  //   !departmentName
  // )
  //   return res.status(400).send("Missing Credential");
  // Check Also for profile image exists
  // if (!profileImage) return res.status(404).send("Upload File Not Found");
  const hashedPassword = await hashPassword(password);
  // Create user data with the file URL
  const userData = {
    username: username || "Hnin Hnin",
    password: hashedPassword || "admin@123",
    Email: email || "staff@gmail.com",
    Gender: gender || "female",
    Role: role || 5000,
    Position: position || "L2",
    EmployeeId: employeeId || 2222,
    Salary: salary || 50000,
    ProfileImage: "someImageLinkFromMobile" || null,
    DOB: dob || "12-2-2000",
    PhoneNumber: phoneNumber || 22222,
    Address: address || "Dawbon",
    AnnualLeave: annualLeave || 3,
    MedicalLeave: medicalLeave || 1,
    AttendanceLeave: attendanceLeave || 3,
    NRC: nrc || "12/DPN(N)983829",
    refreshToken: null,
    DepartmentId: departmentId || 2,
  };

  try {
    // Create the user with the user data
    await Users.create(userData);
    res.status(201).json({ message: "Created User Successfully" });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({ message: "Employee ID or NRC already exists." });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const getUserList = async (req, res, next) => {
  const page = Math.max(0, Number.parseInt(req.query.page) || 0);
  const size = Math.min(Math.max(Number.parseInt(req.query.size) || 10, 1), 10);

  const { position, department, username, sort, employeeId } = req.query;

  const totalCount = await Users.count();
  const totalPage = Math.ceil(totalCount / size);

  try {
    const whereClause = {
      ...(position && { Position: position }),
      ...(username && { username: { [Op.like]: `%${username}%` } }),
      ...(employeeId && { EmployeeId: employeeId }),
    };
    // Define a mapping from sort parameter to order configuration
    const sortOrders = {
      desc: [["username", "DESC"]],
      asc: [["username", "ASC"]],
    };

    // Use the sort parameter to determine the order, defaulting to [["id", "DESC"]] if sort is not specified or invalid
    let order = sortOrders[sort] || [["id", "DESC"]];
    const users = await Users.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          attributes: ["DeptName"],
          ...(department && { where: { DeptName: department } }),
        },
      ],
      order: order,
      limit: size,
      offset: page * size,
    });

    res.status(200).json({
      columns: [
        { header: "username", accessor: "username" },
        { header: "position", accessor: "position" },
        { header: "employeeId", accessor: "employeeId" },
        { header: "salary", accessor: "salary" },
        { header: "annualLeave", accessor: "annualLeave" },
        { header: "medicalLeave", accessor: "medicalLeave" },
        { header: "attendanceLeave", accessor: "attendanceLeave" },
        { header: "departmentName", accessor: "deptName" },
        { header: "nrc", accessor: "NRC" },
        { header: "phoneNumber", accessor: "PhoneNumber" },
      ],
      datas: users,
      totalPage,
      totalCount,
    });
  } catch (error) {
    next();
    console.error(error);
  }
};

const updateUserData = async (req, res) => {
  const { id } = req.params;

  const userId = await Users.findOne({ where: { id: id } });
  const { role, position, salary, phoneNumber, address } = req.body;

  if (!userId) return res.status(404).json("user id not found");
  const updateUserData = await userId.update({
    Role: role,
    Position: position,
    Salary: salary,
    PhoneNumber: phoneNumber,
    Address: address,
  });
  if (!updateUserData) return res.status(404).json("user not updated");
  res.status(200).json({ message: "Updated successfully" });
};
module.exports = { createStaff, deleteStaff, getUserList, updateUserData };
