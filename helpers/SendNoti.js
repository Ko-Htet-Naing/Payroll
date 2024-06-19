const { Fcm_Tokens } = require("../models");
const { admin } = require("../config/firebaseConfig");
const DBHelper = require("../helpers/DBHelper");

// Token valid ဖြစ်မဖြစ် စစ်ဆေးပေးတဲ့ function
const isValidToken = async (userId) => {
  const result = await Fcm_Tokens.findOne({
    where: { UserId: userId },
    attributes: ["token"],
    raw: true,
  });
  return result?.token;
};

const SendNoti = async (title, message, UserId) => {
  // Added this line for the safety purpose
  const userDeviceToken = await isValidToken(UserId);
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
    admin
      .messaging()
      .send(notificationMessage)
      .then((response) => {
        console.log("Successfully sent message ", response);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.log("Null case");
  }
};

//Send noti using socket.io
const sentNotification = (userId, message) => {
  if (userId) {
    io.to(userId).emit("notification", message);
  } else {
    console.log(`User ${userId} is not connected`);
  }
};

module.exports = { SendNoti, isValidToken };
