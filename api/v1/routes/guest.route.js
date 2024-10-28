const guestController = require("../controller/guest.controller");
const route = require('express').Router();

route.post("/create", guestController.create);

module.exports = route;