const paymentController = require("../controller/payment.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();

route.use(verifyToken);
route.get("/getDetail", paymentController.getDetail);
route.use(checkRole("Manager", "Staff"));
route.get("/getAll", paymentController.getAll);
route.post("/generateQR", paymentController.generateQR);
route.post("/create", paymentController.create);
route.patch("/update", paymentController.update);
route.delete("/softDel", paymentController.softDel);

module.exports = route;