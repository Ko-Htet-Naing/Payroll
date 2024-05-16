const express = require("express");
const router = express.Router();
const attendanceController = require("../../controller/attendanceController");
const attendanceClick = require("../../controller/attendanceClickController");

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: The Attendance managing API
 * paths:
 *   /api/v1/attendance/click:
 *      post:
 *        summary: Attendance managing API
 *        tags: [Attendance]
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Attendance'
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
 *   components:
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
 *          name: pageSize
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
 *   /api/v1/attendance:
 *      get:
 *        summary: Lists all the attendance
 *        tags: [Attendance]
 *        parameters:
 *          - $ref: '#/components/parameters/PageParam'
 *          - $ref: '#/components/parameters/PageSizeParam'
 *          - $ref: '#/components/parameters/UsernameQueryParam'
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
 */
router.get("/", attendanceController.getAttendance);
router.post("/click", attendanceClick.realTimeClick);

module.exports = router;
