const customerController = require("../controller/customer.controller");
const route = require("express").Router();
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.use(verifyToken);
route.get("/detail", customerController.detail);
route.patch("/update", uploadCloudMiddleware, customerController.update);
route.use(checkRole("Manager"));
route.delete("/delete", customerController.delete);
route.get("/getAll", customerController.getAll);


module.exports = route;
