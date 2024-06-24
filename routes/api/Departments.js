const router = require("express").Router();
const departmentController = require("../../controller/departmentController");

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: The department  managing API
 * /api/v1/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       200:
 *         description: The created department.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department Not Found
 *   get:
 *     summary: list of department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The created department.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department Not Found
 *
 */
router.post("/", departmentController.create);
router.get("/", departmentController.getAllData);

module.exports = router;
