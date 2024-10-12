const express = require("express");
const staffController = require("../controller/staff.controller");
const uploadCloudMiddleware=require("../middleware/uploadCloud.middleware");
const route = express.Router();
const uploadCloudMiddleware= require("../middleware/uploadCloud.middleware");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

route.use(verifyToken);
//get the detail from staff by send param id
route.get("/detail",staffController.getStaffDetail);

//update the detail from staff by send param id
<<<<<<< HEAD
route.patch("/update", uploadCloudMiddleware, staffController.updateStaff);
=======
route.patch("/update",uploadCloudMiddleware,staffController.updateStaff);
>>>>>>> 12454d8f82c753156f3d307102abda7c8b261172

route.use(checkRole("Manager"));
//get all the staff from database
route.get("/getAll",staffController.getAllStaff);

//soft delete staff by send param id
route.delete("/softDel",staffController.softDel);


module.exports = route;