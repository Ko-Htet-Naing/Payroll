const router = require("express").Router();
const Login = require("../../helpers/Login");
const Logout = require("../../helpers/Logout");

router.post("/loginUser", Login);
router.get("/logoutUser/:id", Logout);
module.exports = router;
