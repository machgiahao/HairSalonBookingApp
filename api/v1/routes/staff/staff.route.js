const express = require("express");
const staffController=require(`../../controller/staff/staff.controller`);
const route = express.Router();

// lay tat ca staff
route.get(`/getAll`,staffController.getAll);

//lay tat ca detail cua 1 staff record
route.get(`/detail/:id`,staffController.getDetails);

//update record cua 1 staff dua tren id
route.patch(`/update/:id`,staffController.update);

module.exports = route;