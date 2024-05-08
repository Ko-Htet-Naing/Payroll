const { Users } = require("../models");
const { comparePassword } = require("../helpers/Auth");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (req, res) => {
  let { username, password } = req.body;
  console.log(username, password);
  const user = await Users.findOne({
    where: { username: username },
  });
  if (!user) return res.status(404).send("User not found");
  const dbComparePassword = await comparePassword(
    password,
    user.dataValues.password
  );
  if (!dbComparePassword) res.status(401).send({ message: "Wrong Password" });
  const dbUsername = user.dataValues.username;
  const role = user.dataValues.role;

  // Token Creation
  const accessToken = jwt.sign(
    { UserInfo: { username: dbUsername, role: role } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "6m" }
  );
  const refreshToken = jwt.sign(
    {
      UserInfo: { username: dbUsername },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  // Reset User
  await Users.update(
    { refreshToken: refreshToken },
    { where: { username: dbUsername } }
  );

  //Setting cookie
  res.cookie("jwt_ref", refreshToken, {
    secure: true, // Set to true for HTTPS
    sameSite: "None",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    token: accessToken,
    username: user.username,
    role: user.role,
  });
};

module.exports = {
  login,
};
