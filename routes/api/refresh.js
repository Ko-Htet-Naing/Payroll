const { Router } = require("express");
const refreshController = require("../../controller/refreshTokenController");
const router = Router();

router.post("/", refreshController.handleRefreshToken);

module.exports = router;
