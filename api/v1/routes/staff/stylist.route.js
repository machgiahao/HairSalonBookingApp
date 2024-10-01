const express = require("express");
const stylistController=require(`../../controller/staff/stylist.controller`);
const route = express.Router();

//lay tat ca record cua stylist
route.get(`/getAll`,stylistController.getAll);

//lay tat ca detail cua 1 stylist record
route.get(`/detail/:id`,stylistController.getDetails);

//update record cua 1 stylist dua tren id
route.patch(`/update/:id`,stylistController.update);

module.exports = route;