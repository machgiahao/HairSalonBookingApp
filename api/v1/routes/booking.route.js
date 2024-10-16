const bookingController = require("../controller/booking.controller");
const route = require("express").Router();

route.post("/create", bookingController);
route.get("/detail", bookingController);
route.patch("/update", bookingController);
route.delete("/delete", bookingController);



















