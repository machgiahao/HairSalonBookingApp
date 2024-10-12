const express = require("express");
const staffController = require("../controller/staff.controller");
const uploadCloudMiddleware=require("../middleware/uploadCloud.middleware");
const route = express.Router();

//get the detail from staff by send param id
route.get("/detail",staffController.getStaffDetail);

//update the detail from staff by send param id
route.patch("/update",uploadCloudMiddleware,staffController.updateStaff);

//get all the staff from database
route.get("/getAll",staffController.getAllStaff);

//soft delete staff by send param id
route.delete("/softDel",staffController.softDel);


module.exports = route;