const userController = require("../controller/user.controller")
const route = require("express").Router();
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.get("/getAll", checkRole("Manager") , userController.getAll);
route.post("/contact", userController.contact);
route.use(verifyToken);
route.get("/getCurrent", userController.getCurrent);

module.exports = route;

























