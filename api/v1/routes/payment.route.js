const paymentController = require("../controller/payment.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();

route.get("/getAll", paymentController.getAll);
route.get("/getDetail", paymentController.getDetail);

route.use(verifyToken);
route.use(checkRole("Staff"));
route.post("/create", paymentController.create);
route.post("/generateQR", paymentController.generateVietQR);

route.use(checkRole("Manager", "Staff"))
route.patch("/update", paymentController.update);
route.delete("/softDel", paymentController.softDel);

module.exports = route;
