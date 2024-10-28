const userController = require("../controller/user.controller")
const route = require("express").Router();
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.use(verifyToken);
route.get("/getCurrent", userController.getCurrent);
route.get("/getAll", checkRole("Manager") , userController.getAll);

module.exports = route;

























