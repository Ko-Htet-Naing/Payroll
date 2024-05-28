const jwt = require("jsonwebtoken");
const { Users } = require("../models");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt_ref) return res.status(404).send("Crential Missing");
  const refreshToken = req.cookies.jwt_ref;
  const foundUser = await Users.findOne({
    where: { refreshToken: refreshToken },
  });
  if (!foundUser) return res.status(404).send("User not found");
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    function (err, decoded) {
      if (err) return res.status(400).send(err);
      const accessToken = jwt.sign(
        { UserInfo: { username: decoded.username, role: decoded.role } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "3h" }
      );
      res.status(200).send({
        user: foundUser.username,
        roles: foundUser.role,
        accessToken: accessToken,
      });
    }
  );
};
module.exports = { handleRefreshToken };
