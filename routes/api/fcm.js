const Router = require("express").Router();
const { Fcm_Tokens } = require("../../models");

Router.post("/send", async function (req, res) {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(404).send("UserId or Token Missing");
  try {
    await Fcm_Tokens.create({
      UserId: userId,
      token: token,
    });
    res.sendStatus(200);
  } catch (error) {
    throw new Error("Error while adding fcm token to database", error);
  }
});

module.exports = Router;
