/**
 * @swagger
 * /customer/getAll:
 *   get:
 *     tags: [Customer]
 *     summary: Get all customers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 */

/**
 * @swagger
 * /customer/detail:
 *   get:
 *     tags: [Customer]
 *     summary: Get customer detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 */

/**
 * @swagger
 * /customer/update:
 *   patch:
 *     tags: [Customer]
 *     summary: Update customer
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
 *         description: Customer updated
 */

/**
 * @swagger
 * /customer/delete:
 *   delete:
 *     tags: [Customer]
 *     summary: Delete customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted
 */

const customerController = require("../controller/customer.controller");
const route = require("express").Router();
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.get("/getAll", customerController.getAll);
route.use(verifyToken);
route.get("/detail", customerController.detail);
route.patch("/update", uploadCloudMiddleware, customerController.update);
route.use(checkRole("Manager"));
route.delete("/delete", customerController.delete);

module.exports = route;