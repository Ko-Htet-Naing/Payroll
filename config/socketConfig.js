const { Server } = require("socket.io");

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("Client Connected");
    io.emit("message", "Socket.io again");
    socket.on("disconnect", () => {
      console.log("Client Disconnected");
    });
  });
};

const sendNotification = (userId, message) => {
  if (io) {
    io.to(userId).emit("notification", message);
  }
};
module.exports = { initializeSocket, sendNotification };
