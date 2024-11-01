const paymentController = require("../controller/payment.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();

// Tuyến không yêu cầu xác thực
route.get("/getAll", paymentController.getAll);
// verifyToken
route.get("/getDetail", verifyToken, paymentController.getDetail);
// verifyToken + stylist
route.post("/create", verifyToken, checkRole("Stylist"), paymentController.create);
// verifyToken + staff
route.post(
    "/generateQR",
    verifyToken,
    checkRole("Staff"),
    paymentController.generateQR
);
// verifyToken + staff & manager
route.patch("/update", verifyToken, checkRole("Manager", "Staff"), paymentController.update);
route.delete("/softDel", verifyToken, checkRole("Manager", "Staff"), paymentController.softDel);

module.exports = route;
