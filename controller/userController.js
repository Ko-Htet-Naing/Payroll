const { Users, Department } = require("../models");
const admin = require("firebase-admin");
const { getStorage, ref, getDownloadURL } = require("firebase/storage");

// Initialize Firebase Admin SDK with my service account credentials
const serviceAccount = require("../private/imagestorage-2095c-firebase-adminsdk-ehic7-f0929e1d93.json");

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
    nrc,
    departmentId,
  } = req.body;

  // Upload Image to Firebase
  const profileImage = req.file;
  if (!profileImage) return res.status(404).send("Upload File Not Found");
  // Variable to store upload URL
  let imageUrl = "";
  try {
    // Upload file to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileUpload = bucket.file(profileImage.originalname);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: profileImage.mimetype,
      },
    });

    // Handle Successful upload
    stream.on("finish", async () => {
      // Get the uploaded image URL
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

      // Create user data with the file URL
      const userData = {
        username: username || "staff",
        password: password || "staff@123",
        Email: email || "staff@gmail.com",
        Gender: gender || "male",
        Role: role || 5000,
        Position: position || "L1",
        EmployeeId: employeeId || 1111,
        Payroll: payroll || 40000,
        ProfileImage: imageUrl || null,
        DOB: dob || "12-2-2000",
        PhoneNumber: phoneNumber || 22222,
        Address: address || "Dawbon",
        AnnualLeave: annualLeave || 1,
        MedicalLeave: mediacalLeave || 1,
        NRC: nrc || "12/DPN(N)983829",
        DepartmentId: departmentId || 1,
      };

      // Create the user with the user data
      await Users.create(userData);

      // Send success response
      res.status(200).send("Successfully Created");
    });

    // Handle upload error
    stream.on("error", (err) => {
      console.error("Error uploading file to Firebase Storage:", err);
      res.status(500).send("Failed to upload image");
    });

    // Pipe the file data to the Firebase Storage stream
    stream.end(profileImage.buffer);
  } catch (err) {
    console.error("Error uploading file to Firebase Storage:", err);
    res.status(500).send("Failed to upload image");
  }
};

module.exports = { createStaff, deleteStaff };

module.exports = { createStaff, deleteStaff };
