const express = require("express");
const route= express.Router();
const newsController = require("../controller/news.controller")
const uploadCloudMiddleware= require("../middleware/uploadCloud.middleware");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.get("/getAll",newsController.getAll)

route.get("/getDetail",newsController.getDetail)
route.use(verifyToken);
route.use(checkRole("Manager", "Staff"));
route.patch("/update",uploadCloudMiddleware,newsController.update)

route.patch("/delete",newsController.softDelete)

route.delete("/delete",newsController.delete)

route.post("/create",uploadCloudMiddleware,newsController.create);

module.exports=route;



