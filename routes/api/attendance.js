const express = require("express");
const router = express.Router();
const attendanceController = require("../../controller/attendanceController");
const attendanceClick = require("../../controller/attendanceClickController");

/**
 * @swagger
 * tags:
 *      name: Attendance
 *      description: The Attendance managing API
 * /api/v1/attendance/click:
 *      post:
 *        summary: Attendance managing API
 *        tags: [Attendance]
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
 *                  - dateTime
 *                  - userId
 *                properties:
 *                  dateTime:
 *                    type: string
 *                  userId:
 *                    type: number
 *                example:
 *                  dateTime: 2024-05-16 16:20:00
 *                  userId: 1
 *        responses:
 *          200 :
 *            description: user login created
 *          400 :
 *            description: Invalid input
 * components:
 *      parameters:
 *        PageParam:
 *          name: page
 *          in: query
 *          description: The page number to retrieve
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 0
 *            default: 0
 *        PageSizeParam:
 *          name: size
 *          in: query
 *          description: The number of items per page
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 0
 *            maximum: 100
 *            default: 10
 *        UsernameQueryParam:
 *          name: username
 *          in: query
 *          description: The username to search for
 *          required: false
 *          schema:
 *            type: string
 *        FromDateQueryParam:
 *          name: fromDate
 *          in: query
 *          description: The fromDate to search for
 *          required: false
 *          schema:
 *            type: string
 *            format: date
 *        ToDateQueryParam:
 *          name: toDate
 *          in: query
 *          description: The toDate to search for
 *          required: false
 *          schema:
 *            type: string
 *            format: date
 *        PositionQueryParam:
 *          name: position
 *          in: query
 *          description: The position to search for
 *          required: false
 *          schema:
 *            type: string
 *        DepartmentQueryParam:
 *          name: department
 *          in: query
 *          description: The department name to search for
 *          required: false
 *          schema:
 *            type: string
 *        EmployeeIdQueryParam:
 *          name: employeeId
 *          in: query
 *          description: The employee id to search for
 *          required: false
 *          schema:
 *            type: string
 *
 * /api/v1/attendance:
 *      get:
 *        summary: Lists all the attendance
 *        tags: [Attendance]
 *        security:
 *          - bearerAuth: []
 *        parameters:
 *          - $ref: '#/components/parameters/PageParam'
 *          - $ref: '#/components/parameters/PageSizeParam'
 *          - $ref: '#/components/parameters/UsernameQueryParam'
 *          - $ref: '#/components/parameters/FromDateQueryParam'
 *          - $ref: '#/components/parameters/ToDateQueryParam'
 *          - $ref: '#/components/parameters/PositionQueryParam'
 *          - $ref: '#/components/parameters/DepartmentQueryParam'
 *          - $ref: '#/components/parameters/EmployeeIdQueryParam'
 *        responses:
 *          200:
 *            description: The list of the attendance
 *            content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Attendance'
 * /api/v1/attendance/{UserId}:
 *      get:
 *        summary: Lists all the attendance by userId
 *        tags: [Attendance]
 *        security:
 *          - bearerAuth: []
 *        parameters:
 *          - in: path
 *            name: UserId
 *            schema:
 *              type: integer
 *            required: true
 *            description: the user id
 *          - $ref: '#/components/parameters/PageParam'
 *          - $ref: '#/components/parameters/PageSizeParam'
 *          - $ref: '#/components/parameters/FromDateQueryParam'
 *          - $ref: '#/components/parameters/ToDateQueryParam'
 *        responses:
 *          200:
 *            description: The list of the attendance
 *            content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Attendance'
 *
 */
router.get("/", attendanceController.getAttendance);
router.post("/click", attendanceClick.realTimeClick);
router.get("/:UserId", attendanceController.getAttendanceByUserId);

module.exports = router;
