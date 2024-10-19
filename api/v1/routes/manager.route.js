const managerController = require("../controller/manager.controller")
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")
const route = require("express").Router();

route.get("/detail", managerController.detail);
route.patch("/update", uploadCloudMiddleware, managerController.update);

module.exports = route