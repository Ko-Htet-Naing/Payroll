const admin = require("firebase-admin");
const serviceAccount = require("../private/notification-ef072-firebase-adminsdk-dek49-01ca10dd2d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const token =
  "f0JLHX0CF2A:APA91bGf8cEe7sMjM6L3Kl4t6It7r7kPmOpjRL1-QRJFkTfbx5V8ELN1eLUsKT4ixzszG8x7YpsjMg9MW5aF9phVj10dml61zQFp1C8ZtTsfyr8xMmjApCkxO3cLzeMx4xJUWlm2leV7";

module.exports = {
  admin,
  token,
};
