const { Users } = require("../models");
const { hashPassword } = require("../helpers/Auth");

const createAccount = async (req, res) => {
  let { username, password, email } = req.body;
  if (!username || !password || !email)
    res.status(400).send("Missing Credential");
  const hashedPassword = await hashPassword(password);

  let userData = {
    username: username,
    password: hashedPassword,
    role: "2001",
    email: email,
  };

  console.log(userData);
  await Users.create(userData);
  res.status(200).send("Successfully Created");
};

module.exports = { createAccount };
