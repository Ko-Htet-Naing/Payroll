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
 *     responses:
 *       200:
 *         description: The status was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRecord'
 *       404:
 *         description: The leave record was not found
 */
router.post("/createLeave", leaveRecordController.createLeave);

router.get("/", leaveRecordController.getLeaveList);
router.patch("/:id", leaveRecordController.updatedStatus);

module.exports = router;
