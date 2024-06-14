const express = require("express");
const router = express.Router();
const payrollController = require("../../controller/payrollController");

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: The payroll record managing API
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
 *     DepartmentQueryParam:
 *        name: department
 *        in: query
 *        description: The department name to search for
 *        required: false
 *        schema:
 *          type: string
 *     PositionQueryParam:
 *        name: leaveType
 *        in: query
 *        description: The position to search for
 *        required: false
 *        schema:
 *          type: string
 *     EmployeeIdQueryParam:
 *        name: employeeId
 *        in: query
 *        description: The employeeId to search for
 *        required: false
 *        schema:
 *          type: string
 *     MonthNameQueryParam:
 *        name: monthname
 *        in: query
 *        description: The month name to search for
 *        required: false
 *        schema:
 *          type: string
 *     YearQueryParam:
 *        name: year
 *        in: query
 *        description: The year to search for
 *        required: false
 *        schema:
 *          type: integer

 * /api/v1/payroll:
 *   get:
 *     summary: Lists all the leave records
 *     tags: [Payroll]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - $ref: '#/components/parameters/UsernameQueryParam'
 *       - $ref: '#/components/parameters/DepartmentQueryParam'
 *       - $ref: '#/components/parameters/PositionQueryParam'
 *       - $ref: '#/components/parameters/EmployeeIdQueryParam'
 *       - $ref: '#/components/parameters/MonthNameQueryParam'
 *       - $ref: '#/components/parameters/YearQueryParam'
 *     responses:
 *       200:
 *         description: The list of payroll record.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Payroll'
 *       404:
 *         description: Payroll Record Not Found
 * /api/v1/payroll/attendanceList/{UserId}:
 *   get:
 *     summary: Get the leave records by UserId
 *     tags: [Payroll]
 *     parameters:
 *       - in: path
 *         name: UserId
 *         schema:
 *           type: integer
 *         required: true
 *         description: the user id
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
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
 */
router.get("/", payrollController.getPayrollForOneMonth);
router.get("/attendanceList/:UserId", payrollController.AttendanceListByUserId);

module.exports = router;
