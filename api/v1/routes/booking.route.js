const bookingController = require("../controller/booking.controller");
const route = require("express").Router();

route.post("/create", bookingController.create);
route.get("/detail", bookingController.detail);
route.get("/getAll", bookingController.getAll);
route.patch("/update", bookingController.update);
route.patch("/change-status", bookingController.changeStatus);
route.delete("/delete", bookingController.delete);

module.exports = route;

















