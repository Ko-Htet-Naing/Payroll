const router = require("express").Router();
const createStaff = require("../../controller/userController");
const multer = require("multer");

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // Check file is image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// set up multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post(
  "/createUser",
  upload.single("profileImage"),
  createStaff.createStaff
);
router.delete("/deleteUser/:id", createStaff.deleteStaff);

module.exports = router;
