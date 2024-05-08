const { Users } = require("../models");
const { hashPassword } = require("../helpers/Hash");

const ResetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ error: "Email is required to reset a password" });
  }

  const userData = await Users.findOne({ where: { Email: email } });

  if (!userData) {
    return res.status(404).json({ error: "User not found" });
  }

  const newHashPassword = await hashPassword(newPassword);
  try {
    await Users.update(
      { password: newHashPassword },
      {
        where: {
          Email: email,
        },
      }
    );

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "An error occurred while updating user" });
  }
};

module.exports = ResetPassword;
