const Router = require("express").Router();
const { fcmTokenControl } = require("../../controller/fcmTokenController");
const { Fcm_Tokens } = require("../../models");

Router.post("/send", fcmTokenControl);

module.exports = Router;
