/**
 * @swagger
 * /feedback/getAll:
 *   get:
 *     tags: [Feedback]
 *     summary: Get all feedback
 *     responses:
 *       200:
 *         description: List of feedback
 */

/**
 * @swagger
 * /feedback/detail:
 *   get:
 *     tags: [Feedback]
 *     summary: Get feedback detail
 *     parameters:
 *       - in: query
 *         name: feedbackID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback details
 */

/**
 * @swagger
 * /feedback/create:
 *   post:
 *     tags: [Feedback]
 *     summary: Create feedback
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
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback created
 */

/**
 * @swagger
 * /feedback/update:
 *   patch:
 *     tags: [Feedback]
 *     summary: Update feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedbackID:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated
 */

/**
 * @swagger
 * /feedback/delete:
 *   delete:
 *     tags: [Feedback]
 *     summary: Delete feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: feedbackID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback deleted
 */

const feedbackController = require("../controller/feedback.controller");
const { verifyToken } = require("../middleware/verifyToken.middleware");
const route = require('express').Router();

route.get("/detail", feedbackController.detail);
route.get("/getAll", feedbackController.getAll);
route.use(verifyToken)
route.post("/create", feedbackController.create);
route.patch("/update", feedbackController.update);
route.delete("/delete", feedbackController.delete);

module.exports = route;