const express = require("express");
const stylistController = require("../controller/stylist.controller"); 
const uploadCloudMiddleware= require("../middleware/uploadCloud.middleware");
const route = express.Router();

// Get the detail of a stylist by sending param id
route.get("/detail", stylistController.getStylistDetail);

// Update the detail of a stylist by sending param id
route.patch("/update", uploadCloudMiddleware, stylistController.updateStylist);

// Get all the stylists from the database
route.get("/getAll", stylistController.getAllStylists);

//soft delete stylist by send param id
route.delete("/softDel",stylistController.softDel);

// route.post("/upload", upload.single("image"), stylistController.uploadImg);

module.exports = route;
