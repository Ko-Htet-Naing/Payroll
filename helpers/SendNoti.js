const { Fcm_Tokens } = require("../models");
const { getMessaging } = require("../config/firebaseConfig");
const DBHelper = require("../helpers/DBHelper");

const SendNoti = async (title, message, UserId) => {
  const tokenData = await Fcm_Tokens.findOne({
    where: { UserId: UserId },
    attributes: ["token"],
    raw: true,
  });

  // Added this line for the safety purpose
  const userDeviceToken = tokenData?.token ?? 0;

  let notificationMessage = {
    notification: {
      title: title,
      body: `Dear ${await DBHelper.getUsernameFromDB(UserId)},
      ${message}
       `,
    },
    token: userDeviceToken,
  };
  // If user fcm token not found
  if (userDeviceToken === 0) return false;
  getMessaging()
    .send(notificationMessage)
    .then((response) => {
      console.log("Successfully sent message ", response);
    })
    .catch((error) => {
      console.log(error);
    });
};
module.exports = { SendNoti };
