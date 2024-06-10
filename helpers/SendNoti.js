const { Fcm_Tokens } = require("../models");
const { getMessaging } = require("../config/firebaseConfig");
const DBHelper = require("../helpers/DBHelper");
const { redisClient, notificationQueue } = require("../config/bullConfig");

const SendNoti = async (title, message, UserId) => {
  const tokenData = await Fcm_Tokens.findOne({
    where: { UserId: UserId },
    attributes: ["token"],
    raw: true,
  });

  // Added this line for the safety purpose
  const userDeviceToken = tokenData?.token;

  // Composing sending noti
  let notificationMessage = {
    notification: {
      title: title,
      body: `Dear ${await DBHelper.getUsernameFromDB(UserId)},
      ${message}
       `,
    },
    token: userDeviceToken,
  };

  // Send noti only when user login else save in queue
  if (userDeviceToken !== null) {
    getMessaging()
      .send(notificationMessage)
      .then((response) => {
        console.log("Successfully sent message ", response);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    await notificationQueue.add({ UserId, title, message });
    console.log("Notification queue for later delivery");
  }
};
module.exports = { SendNoti };
