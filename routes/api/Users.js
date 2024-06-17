const router = require("express").Router();
const user = require("../../controller/userController");

const ResetPassword = require("../../helpers/ResetPassword");

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: The employee managing API
 * /api/v1/users/createUser:
 *   post:
 *     summary: Create a new employee record from HR
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *     responses:
 *       200:
 *         description: Created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       404:
 *         description: User Not Found
 * components:
 *   parameters:
 *     PageParam:
 *        name: page
 *        in: query
 *        description: The page number to retrieve
 *        required: false
 *        schema:
 *          type: integer
 *          minimum: 0
 *          default: 0
 *     PageSizeParam:
 *        name: pageSize
 *        in: query
 *        description: The number of items per page
 *        required: false
 *        schema:
 *          type: integer
 *          minimum: 0
 *          maximum: 100
 *          default: 10
 *     UsernameQueryParam:
 *        name: username
 *        in: query
 *        description: The username to search for
 *        required: false
 *        schema:
 *          type: string
 *     PositionQueryParam:
 *        name: position
 *        in: query
 *        description: The position to search for
 *        required: false
 *        schema:
 *          type: string
 *     DepartmentQueryParam:
 *        name: department
 *        in: query
 *        description: The department name to search for
 *        required: false
 *        schema:
 *          type: string
 *     EmployeeIdQueryParam:
 *        name: employeeId
 *        in: query
 *        description: The employee id to search for
 *        required: false
 *        schema:
 *          type: string
 *     SortByUsernameQueryParam:
 *        name: sort
 *        in: query
 *        description: The sort by username to search for
 *        required: false
 *        schema:
 *          type: string
 * /api/v1/users:
 *   get:
 *     summary: Lists all the books
 *     tags: [Employee]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/UsernameQueryParam'
 *       - $ref: '#/components/parameters/PositionQueryParam'
 *       - $ref: '#/components/parameters/DepartmentQueryParam'
 *       - $ref: '#/components/parameters/EmployeeIdQueryParam'
 *       - $ref: '#/components/parameters/SortByUsernameQueryParam'
 *     responses:
 *       200:
 *         description: The list of the employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Users'
 * /api/v1/users/deleteUser/{id}:
 *      delete:
 *        summary: Delete a user by Id
 *        tags: [Employee]
 *        parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: The ID of the  user to delete
 *            schema:
 *                type: integer
 *        responses:
 *          200 :
 *            description: User deleted successfully
 *          404 :
 *            description: User not found
 * /api/v1/users/update/{id}:
 *   put:
 *     summary: Update the user record by the id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user record id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *             type: objects
 *             required:
 *               - role
 *               - position
 *               - salary
 *               - phoneNumber
 *               - address
 *             properties:
 *               role: 5000
 *               position: L3
 *               salary: 500000
 *               phoneNumber: 09999999923
 *               address: Yangon
 *     responses:
 *       200:
 *         description: The user record was updated
 *       404:
 *         description: The user record was not found
 */

router.post("/createUser", user.createStaff);
router.get("/", user.getUserList);

router.delete("/deleteUser/:id", user.deleteStaff);
router.put("/update/:id", user.updateUserData);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The Login managing API
 * paths:
 *   /api/v1/users/loginUser:
 *      post:
 *        summary: login managing API
 *        tags: [Users]
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Users'
 *                type: object
 *                required:
 *                  - username
 *                  - password
 *                properties:
 *                  username:
 *                    type: string
 *                  password:
 *                    type: string
 *        responses:
 *          200 :
 *            description: user login created
 *          400 :
 *            description: Invalid input
 *   /api/v1/users/resetPassword:
 *      post:
 *        summary: Reset password managing API
 *        tags: [Users]
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Users'
 *                type: object
 *                required:
 *                  - email
 *                  - oldPassword
 *                  - newPassword
 *                properties:
 *                  email:
 *                    type: string
 *                  oldPassword:
 *                    type: string
 *                  newPassword:
 *                    type: string
 *        responses:
 *          200 :
 *            description: changed password
 *          400 :
 *            description: invalid password
 *   /api/v1/users/logout:
 *      get:
 *        summary: Logout the current user
 *        tags: [Users]
 *        responses:
 *          200 :
 *            description: Logout successful
 *          404 :
 *            description: User not found
 *          400:
 *            description: User already logout
 *
 */
router.post("/resetPassword", ResetPassword);
module.exports = router;
