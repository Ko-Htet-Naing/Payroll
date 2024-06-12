const { Fcm_Tokens, Pending_Notification } = require("../models");
const { admin } = require("../config/firebaseConfig");
async function fcmTokenControl(req, res) {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(404).send("UserId or Token Missing");

  // Find pending notification for fcm provider
  const result = await Pending_Notification.findAll({
    where: { UserId: userId },
    raw: true,
  });
  if (result?.length > 0) {
    result.forEach(async (notification) => {
      const { id, title, message } = notification;
      // send notification using fcm token
      const payload = {
        notification: {
          title: title,
          body: message,
        },
        token: token,
      };
      console.log(payload);
      try {
        await admin
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent message ", response);
          });
        console.log("Notification sent");
      } catch (error) {
        console.error(
          `Error sending notification for notification ${id}: ${error}`
        );
      }
    });
  } else {
    console.log(" I have no message for you");
  }
  try {
    const findToken = await Fcm_Tokens.findOne({
      where: { UserId: userId },
      attributes: ["token", "UserId"],
      raw: true,
    });
    if (findToken?.token === null) {
      const isUpdateSucces = await Fcm_Tokens.update(
        { token: token },
        { where: { UserId: userId } }
      );
      return isUpdateSucces
        ? res.status(200).json({ message: "Successfully Updated" })
        : res.status(401).json({ message: "Update Operation Fail" });
    }
    if (findToken?.UserId !== userId && findToken?.UserId === undefined) {
      const isCreateSuccess = await Fcm_Tokens.create({
        UserId: userId,
        token: token,
      });
      return isCreateSuccess
        ? res.status(200).json({ message: "Successfully Created" })
        : res.status(401).json({ message: "Create Operation Fail" });
    }
    res.status(401).json({ message: "You already send token" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { fcmTokenControl };
