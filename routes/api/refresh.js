const { Router } = require("express");
const refreshController = require("../../controller/refreshTokenController");
const router = Router();

router.get("/", refreshController.handleRefreshToken);

module.exports = router;
