const { Users } = require("../models");
const { Fcm_Tokens } = require("../models");

const logout = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).send({ message: "Id missing to log out" });
  // Access refresh token from database
  const loginUser = await Users.findOne({
    where: { id: id },
    attributes: ["refreshToken", "EmployeeId", "currentAccessToken"],
    raw: true,
  });
  // Add this line for safety
  const isLogin = loginUser?.refreshToken ? true : false;
  if (!isLogin)
    return res.status(404).send({ message: "You already logged out!" });
  try {
    await Users.update(
      { CurrentAccessToken: null, refreshToken: null },
      { where: { EmployeeId: loginUser?.EmployeeId } }
    );
    await Fcm_Tokens.update({ token: null }, { where: { UserId: id } });
    return res.status(200).send({ message: "Successfully Logout!" });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = logout;
