const admin = require("firebase-admin");
const serviceAccount = require("../private/globalta-1ccbf-firebase-adminsdk-f2mcs-d219ca9ef0.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const token =
  "f0JLHX0CF2A:APA91bGf8cEe7sMjM6L3Kl4t6It7r7kPmOpjRL1-QRJFkTfbx5V8ELN1eLUsKT4ixzszG8x7YpsjMg9MW5aF9phVj10dml61zQFp1C8ZtTsfyr8xMmjApCkxO3cLzeMx4xJUWlm2leV7";

let message = {
  notification: {
    title: null,
    body: null,
  },
  token: token,
};

module.exports = {
  admin,
  message,
};
