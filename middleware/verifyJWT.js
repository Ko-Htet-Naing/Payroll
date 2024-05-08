const jwt = require("jsonwebtoken");
require("dotenv").config();

// JWT auth function
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader)
    return res.status(400).send("Request Authorization header fail");
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") {
    return res.status(404).send("Submit from bearer not in plain");
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) return res.status(403).send(err);
      const { username } = decoded.UserInfo;
      const { role } = decoded.UserInfo;
      req.user = username;
      req.role = role;
      next();
    });
  }
};
module.exports = auth;
