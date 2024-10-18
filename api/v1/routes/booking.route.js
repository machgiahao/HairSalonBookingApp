const bookingController = require("../controller/booking.controller");
const route = require("express").Router();

route.post("/create", bookingController.create);
// route.get("/detail", bookingController);
// route.patch("/update", bookingController);
// route.delete("/delete", bookingController);

module.exports = route;

















