/**
 * @swagger
 * /salary/getAll:
 *   get:
 *     tags: [Salary]
 *     summary: Get all daily salaries
 *     responses:
 *       200:
 *         description: List of daily salaries
 */

/**
 * @swagger
 * /salary/dailySalary:
 *   post:
 *     tags: [Salary]
 *     summary: Get daily salary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily salary details
 */

/**
 * @swagger
 * /salary/monthlySalary:
 *   get:
 *     tags: [Salary]
 *     summary: Get monthly salary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monthly salary details
 */

/**
 * @swagger
 * /salary/generalMonthlySalary:
 *   get:
 *     tags: [Salary]
 *     summary: Get general monthly salary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: General monthly salary
 */

/**
 * @swagger
 * /salary/update:
 *   patch:
 *     tags: [Salary]
 *     summary: Update salary
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               salaryID:
 *                 type: string
 *               baseSalary:
 *                 type: number
 *     responses:
 *       200:
 *         description: Salary updated
 */

const express = require("express");
const salaryController = require("../controller/salary.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = express.Router();

route.get("/getAll", salaryController.getAllDailySalary);
route.use(verifyToken);
route.use(checkRole("Manager", "Stylist", "Staff"));
route.post("/dailySalary", salaryController.dailySalary);
route.get("/monthlySalary", salaryController.monthlySalary);
route.get("/generalMonthlySalary", salaryController.generalMonthlySalary);
route.use(checkRole("Manager"))
route.patch("/update", salaryController.updateSalary);

module.exports = route;