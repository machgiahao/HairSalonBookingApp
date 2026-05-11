/**
 * @swagger
 * /payment/getAll:
 *   get:
 *     tags: [Payment]
 *     summary: Get all payments
 *     responses:
 *       200:
 *         description: List of payments
 */

/**
 * @swagger
 * /payment/getDetail:
 *   get:
 *     tags: [Payment]
 *     summary: Get payment detail
 *     parameters:
 *       - in: query
 *         name: paymentID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 */

/**
 * @swagger
 * /payment/create:
 *   post:
 *     tags: [Payment]
 *     summary: Create payment
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
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 */

/**
 * @swagger
 * /payment/generateQR:
 *   post:
 *     tags: [Payment]
 *     summary: Generate VietQR payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Amount:
 *                 type: number
 *               Description:
 *                 type: string
 *     responses:
 *       200:
 *         description: QR code generated
 */

/**
 * @swagger
 * /payment/update:
 *   patch:
 *     tags: [Payment]
 *     summary: Update payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentID:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 */

/**
 * @swagger
 * /payment/softDel:
 *   delete:
 *     tags: [Payment]
 *     summary: Soft delete payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paymentID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted
 */

const paymentController = require("../controller/payment.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();

route.get("/getAll", paymentController.getAll);
route.get("/getDetail", paymentController.getDetail);
route.use(verifyToken);
route.use(checkRole("Staff"));
route.post("/create", paymentController.create);
route.post("/generateQR", paymentController.generateVietQR);
route.use(checkRole("Manager", "Staff"))
route.patch("/update", paymentController.update);
route.delete("/softDel", paymentController.softDel);

module.exports = route;