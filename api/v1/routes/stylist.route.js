/**
 * @swagger
 * /stylist/getAll:
 *   get:
 *     tags: [Stylist]
 *     summary: Get all stylists
 *     responses:
 *       200:
 *         description: List of stylists
 */

/**
 * @swagger
 * /stylist/detail:
 *   get:
 *     tags: [Stylist]
 *     summary: Get stylist detail
 *     parameters:
 *       - in: query
 *         name: stylistID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stylist details
 */

/**
 * @swagger
 * /stylist/update:
 *   patch:
 *     tags: [Stylist]
 *     summary: Update stylist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stylistID:
 *                 type: string
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stylist updated
 */

/**
 * @swagger
 * /stylist/softDel:
 *   delete:
 *     tags: [Stylist]
 *     summary: Soft delete stylist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stylistID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stylist deleted
 */

const express = require("express");
const stylistController = require("../controller/stylist.controller");
const route = express.Router();
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.get("/detail", stylistController.getStylistDetail);
route.get("/getAll", stylistController.getAllStylists);
route.use(verifyToken);
route.patch("/update", uploadCloudMiddleware, stylistController.updateStylist);
route.use(checkRole("Manager"))
route.delete("/softDel", stylistController.softDel);

module.exports = route;