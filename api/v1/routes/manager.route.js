const managerController = require("../controller/manager.controller")
const route = require("express").Router();

route.get("/detail", managerController.detail);
route.patch("/update", managerController.update);

module.exports = route