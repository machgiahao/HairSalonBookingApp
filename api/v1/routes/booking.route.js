const bookingController = require("../controller/booking.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();

route.get("/getAll", bookingController.getAll);
route.use(verifyToken);
route.post("/create", bookingController.create);
route.get("/detail", bookingController.detail);
route.patch("/update", bookingController.update);
route.get("/history", bookingController.history);
route.use(checkRole("Manager", "Stylist", "Staff"));
route.patch("/change-status", bookingController.changeStatus);
route.delete("/delete", bookingController.delete);

module.exports = route;

















