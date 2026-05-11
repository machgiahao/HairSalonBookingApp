/**
 * @swagger
 * /staff/getAll:
 *   get:
 *     tags: [Staff]
 *     summary: Get all staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff
 */

/**
 * @swagger
 * /staff/detail:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff details
 */

/**
 * @swagger
 * /staff/update:
 *   patch:
 *     tags: [Staff]
 *     summary: Update staff
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffID:
 *                 type: string
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff updated
 */

/**
 * @swagger
 * /staff/softDel:
 *   delete:
 *     tags: [Staff]
 *     summary: Soft delete staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted
 */

const express = require("express");
const staffController = require("../controller/staff.controller");
const route = express.Router();
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.get("/getAll", staffController.getAllStaff);
route.get("/detail", staffController.getStaffDetail);
route.patch("/update", uploadCloudMiddleware, staffController.updateStaff);
route.use(checkRole("Manager"));
route.delete("/softDel", staffController.softDel);

module.exports = route;