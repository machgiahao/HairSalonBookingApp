/**
 * @swagger
 * /workshift/getAll:
 *   get:
 *     tags: [Workshift]
 *     summary: Get all workshifts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workshifts
 */

/**
 * @swagger
 * /workshift/detail:
 *   get:
 *     tags: [Workshift]
 *     summary: Get workshift detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workshiftID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workshift details
 */

/**
 * @swagger
 * /workshift/create:
 *   post:
 *     tags: [Workshift]
 *     summary: Create workshift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftDate:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workshift created
 */

/**
 * @swagger
 * /workshift/addStylist:
 *   post:
 *     tags: [Workshift]
 *     summary: Add stylist to workshift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workshiftID:
 *                 type: string
 *               stylistID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stylist added
 */

/**
 * @swagger
 * /workshift/getWorkshift:
 *   get:
 *     tags: [Workshift]
 *     summary: Get all workshifts with details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workshifts with stylists
 */

/**
 * @swagger
 * /workshift/getWorkshiftDetail:
 *   get:
 *     tags: [Workshift]
 *     summary: Get workshift details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workshift details
 */

/**
 * @swagger
 * /workshift/softDel:
 *   delete:
 *     tags: [Workshift]
 *     summary: Soft delete workshift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workshiftID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workshift deleted
 */

/**
 * @swagger
 * /workshift/update:
 *   patch:
 *     tags: [Workshift]
 *     summary: Update workshift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workshiftID:
 *                 type: string
 *               shiftDate:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workshift updated
 */

/**
 * @swagger
 * /workshift/updateStatus:
 *   patch:
 *     tags: [Workshift]
 *     summary: Update stylist workshift status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stylistWorkshiftID:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /workshift/removeStylist:
 *   delete:
 *     tags: [Workshift]
 *     summary: Remove stylist from workshift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stylistWorkshiftID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stylist removed
 */

const express = require("express");
const workshiftController = require("../controller/workshift.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = express.Router();

route.get("/getAll", workshiftController.getAll);
route.use(verifyToken);
route.post("/create", workshiftController.create);
route.post("/addStylist", workshiftController.addStylistToWorkShift);
route.get("/getWorkshift", workshiftController.getAllWorkshift);
route.get("/getWorkshiftDetail", workshiftController.getAllWorkshiftDetail);
route.get("/detail", workshiftController.detail);
route.use(checkRole("Manager"));
route.delete("/softDel", workshiftController.softDel);
route.patch("/update", workshiftController.update);
route.patch("/updateStatus", workshiftController.updateStylistWorkshift);
route.delete("/removeStylist", workshiftController.removeStylistFromWorkShift);

module.exports = route;