const { Users, Department } = require("../models");
const admin = require("firebase-admin");

const { hashPassword, comparePassword } = require("../helpers/Hash");
const { Op, or } = require("sequelize");

require("dotenv").config();

// Initialize Firebase Admin SDK with my service account credentials
const serviceAccount = require("../private/imagestorage-2095c-firebase-adminsdk-ehic7-f0929e1d93.json");
const { refreshToken } = require("firebase-admin/app");

// Initialize app with admin variable
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://imagestorage-2095c.appspot.com",
});

// Hook to synchronize user after user are inserted
Users.addHook("afterCreate", async (user, options) => {
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
    dob,
    phoneNumber,
    address,
    annualLeave,
    mediacalLeave,
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
  // const { id } = await Department.findOne({
  //   where: { deptName: "Software" },
  // });

  // Upload Image to Firebase
  // Variable to store upload URL
  // let imageUrl = "";
  // try {
  // Upload file to Firebase Storage
  // const bucket = admin.storage().bucket();
  // const fileUpload = bucket.file(profileImage.originalname);
  // const stream = fileUpload.createWriteStream({
  //   metadata: {
  //     contentType: profileImage.mimetype,
  //   },
  // });

  // Handle Successful upload
  // stream.on("finish", async () => {
  //   // Get the uploaded image URL
  //   imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

  // Create user data with the file URL
  const userData = {
    username: username || "Hnin Hnin",
    password: hashedPassword || "admin@123",
    Email: email || "staff@gmail.com",
    Gender: gender || "female",
    Role: role || 5000,
    Position: position || "L2",
    EmployeeId: employeeId || 2222,
    Payroll: payroll || 50000,
    ProfileImage: "someImageLinkFromMobile" || null,
    DOB: dob || "12-2-2000",
    PhoneNumber: phoneNumber || 22222,
    Address: address || "Dawbon",
    AnnualLeave: annualLeave || 3,
    MedicalLeave: mediacalLeave || 1,
    AttendanceLeave: attendanceLeave || 3,
    NRC: nrc || "12/DPN(N)983829",
    refreshToken: null,
    DepartmentId: departmentId || 2,
  };

  // Create the user with the user data
  await Users.create(userData);

  // Send success response
  res.status(200).send({ username: userData.username });
  // });

  // Handle upload error
  // stream.on("error", (err) => {
  //   console.error("Error uploading file to Firebase Storage:", err);
  //   res.status(500).send("Failed to upload image");
  // });

  // Pipe the file data to the Firebase Storage stream
  // stream.end(profileImage.buffer);
};
// catch (err) {
//   console.error("Error uploading file to Firebase Storage:", err);
//   res.status(500).send("Failed to upload image");
// }
// };

const getUserList = async (req, res, next) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);

  const position = req.query.position;
  const username = req.query.username;
  const sort = req.query.sort;

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

  const totalCount = await Users.count();
  const totalPage = Math.ceil(totalCount / size);

  try {
    let whereClause = {};
    // filter by position
    if (position) {
      whereClause.Position = position;
    }

    // search by username
    if (username) {
      whereClause.username = { [Op.like]: `%${username}%` };
    }

    // sort by EmployeeId
    const order = [["EmployeeId", "ASC"]];
    //const order = sort === "EmployeeId" ? [["EmployeeId", "DESC"]] : [];
    const users = await Users.findAll({
      where: whereClause,
      include: [{ model: Department, attributes: ["DeptName"] }],
      order: order,
      limit: size,
      offset: page * size,
    });

    res.status(200).json({ data: users, totalPage, totalCount });
  } catch (error) {
    next();
    console.error(error);
  }
};

module.exports = { createStaff, deleteStaff, getUserList };
