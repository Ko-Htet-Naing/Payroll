const router = require("express").Router();
const Login = require("../../helpers/Login");

const Logout = require("../../helpers/Logout");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The Login managing API
 * paths:
 *   /api/v1/login/loginUser:
 *      post:
 *        summary: login managing API
 *        tags: [Users]
 *        security:
 *          - bearerAuth: []
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *
 *                type: object
 *                required:
 *                  - employeeId
 *                  - password
 *                properties:
 *                  employeeId:
 *                    type: string
 *                  password:
 *                    type: string
 *        responses:
 *          200 :
 *            description: user login created
 *          400 :
 *            description: Invalid input
 *   /api/v1/logoutUser/{id}:
 *      get:
 *        summary: Logout the current user
 *        tags: [Users]
 *        parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: the userId
 *        responses:
 *          200 :
 *            description: Logout successful
 *          404 :
 *            description: User not found
 *          400:
 *            description: User already logout
 */

router.post("/loginUser", Login);
router.get("/logoutUser/:id", Logout);
module.exports = router;
