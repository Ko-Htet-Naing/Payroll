const jwt = require("jsonwebtoken");
const { Users } = require("../models");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const { refreshTokenFromUser } = req.body;
  console.log(refreshTokenFromUser);
  if (!refreshTokenFromUser)
    return res.status(404).send("Refresh Token Required To Call This Route");
  const refreshToken = refreshTokenFromUser;
  const foundUser = await Users.findOne({
    where: { refreshToken: refreshToken },
  });
  if (!foundUser) return res.status(404).json({ message: "User not found" });
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async function (err, decoded) {
      if (err) return res.status(400).send(err);
      const { empId, role } = decoded.UserInfo;
      const accessToken = jwt.sign(
        { UserInfo: { empId: empId, role: role } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "3h" }
      );
      try {
        await Users.update(
          { CurrentAccessToken: accessToken },
          { where: { EmployeeId: empId } }
        );
      } catch (error) {
        console.log("Error while updating current access token in db");
        throw new Error(error.message);
      }
      res.status(200).send({
        user: foundUser.username,
        roles: foundUser.role,
        accessToken: accessToken,
      });
    }
  );
};
module.exports = { handleRefreshToken };
