const admin = require("firebase-admin");
const serviceAccount = require("../private/globalta-1ccbf-firebase-adminsdk-f2mcs-d219ca9ef0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
let message = {
  notification: {
    title: null,
    body: null,
  },
  token: null,
};

const getMessaging = () => admin.messaging();

module.exports = {
  admin,
  message,
  getMessaging,
};
