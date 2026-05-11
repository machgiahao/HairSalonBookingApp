/**
 * @swagger
 * /user/getAll:
 *   get:
 *     tags: [User]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */

/**
 * @swagger
 * /user/contact:
 *   post:
 *     tags: [User]
 *     summary: Contact form submission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact form submitted
 */

/**
 * @swagger
 * /user/getCurrent:
 *   get:
 *     tags: [User]
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 */

const userController = require("../controller/user.controller")
const route = require("express").Router();
const { verifyToken } = require("../middleware/verifyToken.middleware")

route.get("/getAll", userController.getAll);
route.post("/contact", userController.contact);
route.use(verifyToken);
route.get("/getCurrent", userController.getCurrent);

module.exports = route;