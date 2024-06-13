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
        if (err) return res.status(401).send(err);
        console.log("I am in verify", decoded);
        const { empId } = decoded.UserInfo;

        // check if the token matches the one stored in database
        console.log(empId);
        const user = await Users.findOne({
          where: {
            EmployeeId: empId,
          },
          attributes: ["CurrentAccessToken"],
          raw: true,
        });
        const dbToken = user?.CurrentAccessToken;
        if (!dbToken || dbToken !== token) {
          return res.status(401).send("Invalid token for this user");
        }
        next();
      }
    );
  }
};
module.exports = auth;
