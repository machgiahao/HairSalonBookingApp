/**
 * @swagger
 * /manager/detail:
 *   get:
 *     tags: [Manager]
 *     summary: Get manager detail
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Manager details
 */

/**
 * @swagger
 * /manager/update:
 *   patch:
 *     tags: [Manager]
 *     summary: Update manager
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager updated
 */

const managerController = require("../controller/manager.controller")
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")
const { verifyToken } = require("../middleware/verifyToken.middleware")
const route = require("express").Router();

route.use(verifyToken)
route.get("/detail", managerController.detail);
route.patch("/update", uploadCloudMiddleware, managerController.update);

module.exports = route