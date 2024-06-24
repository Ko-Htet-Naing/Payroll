const express = require("express");
const router = express.Router();
const attendanceRequestController = require("../../controller/attendanceRequestController");

/**
 * @swagger
 * tags:
 *   name: AttendanceRecord
 *   description: The leave record managing API
 * /api/v1/attendanceRequest/createRequest:
 *   post:
 *     summary: Create a new leave record
 *     tags: [AttendanceRecord]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - date
 *               - UserId
 *             properties:
 *               reason:
 *                  type: string
 *               date:
 *                  type: string
 *                  format: date
 *               UserId:
 *                  type: integer
 *     responses:
 *       200:
 *         description: The created attendance request.s
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Attendance Request Not Found
 * paths:
 *   /api/v1/attendanceRequest/adminApprove:
 *     post:
 *       summary: admin approve
 *       tags: [AttendanceRecord]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                  - id
 *                  - adminApproved
 *               properties:
 *                  id:
 *                    type: integer
 *                  adminApproved:
 *                    type: boolean
 *               example:
 *                  id: 1
 *                  adminApproved: true
 *       responses:
 *         200:
 *           description: Approved successfully
 *         404:
 *           description: User not found
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
 * /api/v1/attendanceRequest:
 *   get:
 *     summary: Lists all the attendance request
 *     tags: [AttendanceRecord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *     responses:
 *       200:
 *         description: The list of attendance request
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Attendance request Not Found
 * /api/v1/getAttendance/{id}:
 *   get:
 *     summary: Lists all the attendance request by Id
 *     tags: [AttendanceRecord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: the user id
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *     responses:
 *       200:
 *         description: The list of the attendance request
 *         content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *
 */

router.post(
  "/createRequest",
  attendanceRequestController.createAttendanceRequest
);
router.post("/adminApprove", attendanceRequestController.confirmRequest);
router.get("/", attendanceRequestController.getAttendanceRequest);
router.patch("/:id", attendanceRequestController.updatedStatus);
router.get(
  "/getAttendance/:id",
  attendanceRequestController.getAttendanceRequestById
);
module.exports = router;
