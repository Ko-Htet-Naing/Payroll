const jwt = require("jsonwebtoken");
const { Users } = require("../models");
require("dotenv").config();

// JWT auth function
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader)
    return res.status(400).send("Request Authorization header fail");
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") {
    return res.status(404).send("Submit from bearer not in plain");
  } else {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async function (err, decoded) {
        if (err) return res.status(403).send(err);
        const { empId } = decoded.UserInfo;
        const { role } = decoded.UserInfo;

        // check if the token matches the one stored in database
        const user = await Users.findOne({
          where: {
            EmployeeId: empId,
          },
          attributes: ["currentAccessToken"],
          raw: true,
        });
        if (!user?.currentAccessToken || user?.currentAccessToken !== token) {
          res.status(403).send("Invalid token for this user");
        }

        req.user = username;
        req.role = role;
        next();
      }
    );
  }
};
module.exports = auth;
