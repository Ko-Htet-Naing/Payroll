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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reasons
 *               - leaveType
 *               - from
 *               - to
 *               - UserId
 *             properties:
 *               reasons:
 *                  type: string
 *               leaveType:
 *                  type: string
 *               from:
 *                  type: string
 *                  format: date
 *               to:
 *                  type: string
 *                  format: date
 *               UsreId:
 *                  type: integer
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
 *     StatusQueryParam:
 *        name: status
 *        in: query
 *        description: The staus to search for
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
 *     LeaveTypeQueryParam:
 *        name: leaveType
 *        in: query
 *        description: The leave type to search for
 *        required: false
 *        schema:
 *          type: string
 *
 * /api/v1/leaveRecord:
 *   get:
 *     summary: Lists all the leave records
 *     tags: [LeaveRecord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/UsernameQueryParam'
 *       - $ref: '#/components/parameters/FromDateQueryParam'
 *       - $ref: '#/components/parameters/ToDateQueryParam'
 *       - $ref: '#/components/parameters/StatusQueryParam'
 *       - $ref: '#/components/parameters/DepartmentQueryParam'
 *       - $ref: '#/components/parameters/LeaveTypeQueryParam'
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
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *             example:
 *               status: "Approved"
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
 *     security:
 *       - bearerAuth: []
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
 *       - $ref: '#/components/parameters/StatusQueryParam'
 *       - $ref: '#/components/parameters/DepartmentQueryParam'
 *       - $ref: '#/components/parameters/LeaveTypeQueryParam'
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             required:
 *               - reasons
 *               - leaveType
 *               - from
 *               - to
 *               - attachmentUrl
 *             properties:
 *               reasons:
 *                  type: string
 *               leaveType:
 *                  type: string
 *               from:
 *                  type: string
 *                  format: date
 *               to:
 *                  type: string
 *                  format: date
 *               attachmentUrl:
 *                  type: string
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
