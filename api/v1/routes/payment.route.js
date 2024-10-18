const paymentController = require("../controller/payment.controller");
const route = require("express").Router();

route.get("/getAll", paymentController.getAll);
route.get("/getDetail", paymentController.getDetail);
route.post("/generateQR", paymentController.generateQR);
route.post("/create", paymentController.create);
route.patch("/update", paymentController.update);
route.delete("/softDel", paymentController.softDel);

module.exports = route;