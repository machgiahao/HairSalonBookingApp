const express = require("express");
const staffController=require(`../../controller/staff/staff.controller`);
const route = express.Router();


route.get(`/detail/:id`,staffController.getDetails)

route.patch(`/update/:id`,staffController.update)

module.exports = route;