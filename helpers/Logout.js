const { Users } = require("../models");

const logout = async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.jwt_ref)
    return res.status(400).send({ message: "You already Logout" });
  const foundUser = await Users.findOne({
    where: { refreshToken: cookie.jwt_ref },
  });
  if (!foundUser)
    return res
      .status(404)
      .send("User not found associate with your credentials");
  Users.update(
    { refreshToken: "" },
    { where: { username: foundUser.username } }
  );
  res.clearCookie("jwt_ref", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 0,
  });
  res.status(200).send("Successfully Logout!");
};

module.exports = logout;
