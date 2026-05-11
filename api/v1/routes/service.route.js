/**
 * @swagger
 * /service/getAll:
 *   get:
 *     tags: [Service]
 *     summary: Get all services
 *     responses:
 *       200:
 *         description: List of services
 */

/**
 * @swagger
 * /service/detail:
 *   get:
 *     tags: [Service]
 *     summary: Get service detail
 *     parameters:
 *       - in: query
 *         name: serviceID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 */

/**
 * @swagger
 * /service/create:
 *   post:
 *     tags: [Service]
 *     summary: Create new service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created
 */

/**
 * @swagger
 * /service/update:
 *   patch:
 *     tags: [Service]
 *     summary: Update service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceID:
 *                 type: string
 *               serviceName:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated
 */

/**
 * @swagger
 * /service/delete:
 *   delete:
 *     tags: [Service]
 *     summary: Delete service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted
 */

const serviceController = require("../controller/service.controller");
const route = require("express").Router();
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")

route.get("/detail", serviceController.detail);
route.get("/getAll", serviceController.getAll);
route.use(verifyToken);
route.use(checkRole("Manager"));
route.post("/create", uploadCloudMiddleware, serviceController.create);
route.patch("/update", uploadCloudMiddleware, serviceController.update);
route.delete("/delete", serviceController.delete);

module.exports = route;