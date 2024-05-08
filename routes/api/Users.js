const router = require("express").Router();
const user = require("../../controller/userController");
const multer = require("multer");
const login = require("../../helpers/Login");
const ResetPassword = require("../../helpers/ResetPassword");
const logout = require("../../helpers/Logout");

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

router.post("/createUser", upload.single("profileImage"), user.createStaff);

router.post("/loginUser", login);
router.post("/resetPassword", ResetPassword);
router.get("/logout", logout);
router.delete("/deleteUser/:id", user.deleteStaff);
module.exports = router;
