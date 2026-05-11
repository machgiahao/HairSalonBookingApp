/**
 * @swagger
 * /news/getAll:
 *   get:
 *     tags: [News]
 *     summary: Get all news
 *     responses:
 *       200:
 *         description: List of news
 */

/**
 * @swagger
 * /news/getDetail:
 *   get:
 *     tags: [News]
 *     summary: Get news detail
 *     parameters:
 *       - in: query
 *         name: newsID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News details
 */

/**
 * @swagger
 * /news/create:
 *   post:
 *     tags: [News]
 *     summary: Create news
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: News created
 */

/**
 * @swagger
 * /news/update:
 *   patch:
 *     tags: [News]
 *     summary: Update news
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newsID:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: News updated
 */

/**
 * @swagger
 * /news/delete:
 *   patch:
 *     tags: [News]
 *     summary: Soft delete news
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: newsID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News deleted
 *   delete:
 *     tags: [News]
 *     summary: Permanently delete news
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: newsID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News deleted permanently
 */

const express = require("express");
const route= express.Router();
const newsController = require("../controller/news.controller")
const uploadCloudMiddleware= require("../middleware/uploadCloud.middleware");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.get("/getAll", newsController.getAll)
route.get("/getDetail", newsController.getDetail)
route.use(verifyToken);
route.use(checkRole("Manager", "Staff"));
route.patch("/update", uploadCloudMiddleware, newsController.update)
route.patch("/delete", newsController.softDelete)
route.delete("/delete", newsController.delete)
route.post("/create", uploadCloudMiddleware, newsController.create);

module.exports=route;