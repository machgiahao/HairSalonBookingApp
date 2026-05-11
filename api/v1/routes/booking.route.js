/**
 * @swagger
 * /booking/getAll:
 *   get:
 *     tags: [Booking]
 *     summary: Get all bookings
 *     responses:
 *       200:
 *         description: List of bookings
 */

/**
 * @swagger
 * /booking/detail:
 *   get:
 *     tags: [Booking]
 *     summary: Get booking detail
 *     parameters:
 *       - in: query
 *         name: bookingID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /booking/create:
 *   post:
 *     tags: [Booking]
 *     summary: Create new booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerID:
 *                 type: string
 *               stylistID:
 *                 type: string
 *               serviceIDs:
 *                 type: array
 *                 items:
 *                   type: string
 *               bookingDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 */

/**
 * @swagger
 * /booking/history:
 *   get:
 *     tags: [Booking]
 *     summary: Get customer booking history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking history
 */

/**
 * @swagger
 * /booking/change-status:
 *   patch:
 *     tags: [Booking]
 *     summary: Change booking status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingID:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /booking/delete:
 *   delete:
 *     tags: [Booking]
 *     summary: Delete booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bookingID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted
 */

const bookingController = require("../controller/booking.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();

route.get("/getAll", bookingController.getAll);
route.get("/detail", bookingController.detail);
route.use(verifyToken);
route.post("/create", bookingController.create);
route.patch("/update", bookingController.update);
route.get("/history", bookingController.history);
route.use(checkRole("Manager", "Stylist", "Staff"));
route.patch("/change-status", bookingController.changeStatus);
route.delete("/delete", bookingController.delete);

module.exports = route;