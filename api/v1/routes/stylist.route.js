const express = require("express");
const stylistController = require("../controller/stylist.controller"); 
const route = express.Router();
const uploadCloudMiddleware= require("../middleware/uploadCloud.middleware");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

// Get the detail of a stylist by sending param id
route.get("/detail", stylistController.getStylistDetail);
route.get("/getAll", stylistController.getAllStylists);

route.use(verifyToken);
// Update the detail of a stylist by sending param id
route.patch("/update", uploadCloudMiddleware, stylistController.updateStylist);

route.use(checkRole("Manager"))
// route.use(checkRole("Manager", "Stylist"));
// Get all the stylists from the database

//soft delete stylist by send param id
route.delete("/softDel",stylistController.softDel);

// route.post("/upload", upload.single("image"), stylistController.uploadImg);

module.exports = route;
