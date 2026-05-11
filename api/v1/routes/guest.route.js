/**
 * @swagger
 * /guest/getAll:
 *   get:
 *     tags: [Guest]
 *     summary: Get all guests
 *     responses:
 *       200:
 *         description: List of guests
 */

/**
 * @swagger
 * /guest/detail:
 *   get:
 *     tags: [Guest]
 *     summary: Get guest detail
 *     parameters:
 *       - in: query
 *         name: guestID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guest details
 */

/**
 * @swagger
 * /guest/create:
 *   post:
 *     tags: [Guest]
 *     summary: Create guest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Guest created
 */

/**
 * @swagger
 * /guest/delete:
 *   delete:
 *     tags: [Guest]
 *     summary: Delete guest
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: guestID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guest deleted
 */

const guestController = require("../controller/guest.controller");
const route = require('express').Router();
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.get("/detail", guestController.detail);
route.get("/getAll", guestController.getAll);
route.post("/create", guestController.create);
route.use(verifyToken);
route.use(checkRole("Manager", "Staff"));
route.delete("/delete", guestController.delete);

module.exports = route;