const managerController = require("../controller/manager.controller")
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")
const { verifyToken } = require("../middleware/verifyToken.middleware")
const route = require("express").Router();

route.use(verifyToken)
route.get("/detail", managerController.detail);
route.patch("/update", uploadCloudMiddleware, managerController.update);

module.exports = route