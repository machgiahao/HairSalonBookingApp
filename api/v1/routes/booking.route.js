const bookController = require("../controller/booking.controller");
const route = require("express").Router();

route.get("/detail", bookController);
route.post("/create", bookController);
route.patch("/update", bookController);
route.delete("/delete", bookController);c



















