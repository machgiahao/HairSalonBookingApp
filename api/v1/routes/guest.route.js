const guestController = require("../controller/guest.controller");
const route = require('express').Router();

route.get("/detail", guestController.detail);
route.post("/create", guestController.create);
route.delete("/delete", guestController.delete);

module.exports = route;