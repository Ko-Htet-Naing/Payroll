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
  //await Payroll.destroy({ UserId: deletedUser.id });
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
  const payroll = await Payroll.findOne({ where: { UserId: id } });
  if (!user) return res.status(404).send("User not found");
  await user.destroy();
  await payroll.destroy();
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
    salary,
    dob,
    phoneNumber,
    address,
    annualLeave,
    medicalLeave,
    attendanceLeave,
    nrc,
    departmentName,
  } = req.body;

  // Check data exists
  if (
    !username ||
    !password ||
    !email ||
    !gender ||
    !role ||
    !position ||
    !employeeId ||
    !salary ||
    !dob ||
    !phoneNumber ||
    !address ||
    !annualLeave ||
    !medicalLeave ||
    !attendanceLeave ||
    !nrc ||
    !departmentName
  )
    return res.status(400).send({ message: "Missing Credential" });
  // Check Also for profile image exists
  const hashedPassword = await hashPassword(password);

  const department = await Department.findOne({
    where: { deptName: departmentName },
  });
  if (!department) {
    return res.status(400).json({ message: "Department not found" });
  }

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
    DepartmentId: department.id || 2,
  };

  try {
    // Create the user with the user data
    await Users.create(userData);
    res.status(201).json({ message: "Created User Successfully" });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({
        message: "Employee ID or NRC or Email or Phone Number already exists.",
      });
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
      ...(position && { Position: { [Op.like]: `%${position}%` } }),
      ...(username && { username: { [Op.like]: `%${username}%` } }),
      ...(employeeId && { EmployeeId: { [Op.like]: `%${employeeId}%` } }),
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

  const {
    username,
    email,
    password,
    position,
    employeeId,
    gender,
    role,
    dob,
    address,
    phoneNumber,
    salary,
    departmentId,
    departmentName,
    nrc,
    annualLeave,
    medicalLeave,
    attendanceLeave,
  } = req.body;

  const user = await Users.findOne({
    attributes: [
      "id",
      "username",
      "Position",
      "EmployeeId",
      "PhoneNumber",
      "Salary",
      "NRC",
      "DepartmentId",
      "AnnualLeave",
      "MedicalLeave",
      "AttendanceLeave",
    ],
    // where: { EmployeeId: employeeId },
    where: { id: id },
  });
  try {
    if (!user) return res.status(400).json({ message: "user not found" });
    let updatedUserData = {};
    const newDepartment = await Department.findOne({
      where: { deptName: departmentName },
    });
    console.log("new department", newDepartment);
    if (newDepartment.id != departmentId) {
      updatedUserData = await user.update({
        username: username,
        Email: email,
        password: password,
        Position: position,
        EmployeeId: employeeId,
        Gender: gender,
        Role: role,
        DOB: dob,
        Address: address,
        PhoneNumber: phoneNumber,
        Salary: salary,
        NRC: nrc,
        AnnualLeave: annualLeave,
        MedicalLeave: medicalLeave,
        AttendanceLeave: attendanceLeave,
        DepartmentId: newDepartment.id,
      });
      const department = await Department.findByPk(departmentId);

      await newDepartment.increment("totalCount", { by: 1 });
      await department.decrement("totalCount", {
        by: 1,
      });
    } else {
      updatedUserData = await user.update({
        username: username,
        Email: email,
        password: password,
        Position: position,
        EmployeeId: employeeId,
        Gender: gender,
        Role: role,
        DOB: dob,
        Address: address,
        PhoneNumber: phoneNumber,
        Salary: salary,
        NRC: nrc,
        AnnualLeave: annualLeave,
        MedicalLeave: medicalLeave,
        AttendanceLeave: attendanceLeave,
        DepartmentId: departmentId,
      });
    }
    if (!updatedUserData)
      return res.status(404).json({ message: "user not updated" });
    res.status(200).json({ message: "Updated successfully", updatedUserData });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({
        message: "Employee ID or NRC or Email or Phone Number already exists.",
      });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
module.exports = { createStaff, deleteStaff, getUserList, updateUserData };
