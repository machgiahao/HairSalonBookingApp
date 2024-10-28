const express = require("express");
const route= express.Router();
const newsController = require("../controller/news.controller")
const uploadCloudMiddleware= require("../middleware/uploadCloud.middleware");


route.get("/getAll",newsController.getAll)

route.get("/getDetail",newsController.getDetail)

route.patch("/update",uploadCloudMiddleware,newsController.update)

route.patch("/delete",newsController.softDelete)

route.delete("/delete",newsController.delete)

route.post("/create",uploadCloudMiddleware,newsController.create);

module.exports=route;



