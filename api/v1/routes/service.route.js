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