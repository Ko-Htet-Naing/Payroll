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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceRecord'
 *     responses:
 *       200:
 *         description: The created attendance request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Attendance Request Not Found
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
 * /api/v1/attendanceRequest/{id}:
 *   patch:
 *     summary: Update the status by the id
 *     tags: [AttendanceRecord]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The attendance request id
 *     requestBody:
 *       required:
 *         - status
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceRecord'
 *     responses:
 *       200:
 *         description: The status was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: The attendance request was not found
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
