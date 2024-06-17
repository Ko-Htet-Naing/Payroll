const router = require("express").Router();
const login = require("../../helpers/Login");

router.post("/loginUser", login);
module.exports = router;
