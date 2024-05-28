const express = require("express");
const router = express.Router();
const leaveRecordController = require("../../controller/leaveRecordController");
/**
 * @swagger
 * tags:
 *   name: LeaveRecord
 *   description: The leave record managing API
 * /api/v1/leaveRecord/createLeave:
 *   post:
 *     summary: Create a new leave record
 *     tags: [LeaveRecord]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveRecord'
 *     responses:
 *       200:
 *         description: The created leave record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRecord'
 *       404:
 *         description: Leave Record Not Found
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
 *     FromDateQueryParam:
 *        name: fromDate
 *        in: query
 *        description: The fromDate to search for
 *        required: false
 *        schema:
 *          type: string
 *          format: date
 *     ToDateQueryParam:
 *        name: toDate
 *        in: query
 *        description: The toDate to search for
 *        required: false
 *        schema:
 *          type: string
 *          format: date
 *
 * /api/v1/leaveRecord:
 *   get:
 *     summary: Lists all the leave records
 *     tags: [LeaveRecord]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/UsernameQueryParam'
 *       - $ref: '#/components/parameters/FromDateQueryParam'
 *       - $ref: '#/components/parameters/ToDateQueryParam'
 *     responses:
 *       200:
 *         description: The list of leave record.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/LeaveRecord'
 *       404:
 *         description: Leave Record Not Found
 * /api/v1/leaveRecord/{id}:
 *   patch:
 *     summary: Update the status by the id
 *     tags: [LeaveRecord]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The leave record id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveRecord'
 *             type: objects
 *             required:
 *               - status
 *             properties:
 *               status: string
 *     responses:
 *       200:
 *         description: The status was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRecord'
 *       404:
 *         description: The leave record was not found
 * /api/v1/leaveRecord/{UserId}:
 *   get:
 *     summary: Get the leave records by UserId
 *     tags: [LeaveRecord]
 *     parameters:
 *       - in: path
 *         name: UserId
 *         schema:
 *           type: integer
 *         required: true
 *         description: the user id
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/UsernameQueryParam'
 *       - $ref: '#/components/parameters/FromDateQueryParam'
 *       - $ref: '#/components/parameters/ToDateQueryParam'
 *     responses:
 *       200:
 *         description: The leave response by userId
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/LeaveRecord'
 *       404:
 *         description: Leave Record Not Found
 * /api/v1/leaveRecord/delete/{id}:
 *   delete:
 *     summary: Remove the leave record by the id
 *     tags: [LeaveRecord]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The leave record id
 *     responses:
 *       200:
 *         description: The leave record was deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRecord'
 *       404:
 *         description: The leave record was not found
 * /api/v1/leaveRecord/update/{id}:
 *   put:
 *     summary: Update the records by the id
 *     tags: [LeaveRecord]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The leave record id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveRecord'
 *             type: objects
 *             required:
 *               - reasons
 *               - leaveType
 *               - from
 *               - to
 *               - attachmentUrl
 *             properties:
 *               reasons: "illness"
 *               leaveType: Medical Leave
 *               from: 2024-5-28
 *               to: 2024-5-28
 *               attachmentUrl: file from url
 *     responses:
 *       200:
 *         description: The leave record was updated
 *       404:
 *         description: The leave record was not found
 */

router.post("/createLeave", leaveRecordController.createLeave);
router.get("/", leaveRecordController.getLeaveList);
router.patch("/:id", leaveRecordController.updatedStatus);

router.get("/:UserId", leaveRecordController.getByUserId);
router.delete("/delete/:id", leaveRecordController.deleteLeaveRecord);
router.put("/update/:id", leaveRecordController.updatedLeaveRecord);
module.exports = router;
