const Bull = require("bull");
const redis = require("redis");

const redisClient = redis.createClient({
  host: "127.0.0.1",
  port: 8000,
});

const notificationQueue = new Bull("notifications", {
  redis: {
    host: "127.0.0.1",
    port: 8000,
  },
});

module.exports = { notificationQueue, redisClient };
