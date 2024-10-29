const guestController = require("../controller/guest.controller");
const route = require('express').Router();

route.get("/detail", guestController.detail);
route.get("/getAll", guestController.getAll);
route.post("/create", guestController.create);
route.delete("/delete", guestController.delete);

module.exports = route;