const express = require("express");
const stylistController = require("../../controller/staff/stylist.controller"); 
const route = express.Router();

// Get the detail of a stylist by sending param id
route.get("/detail/:id", stylistController.getStylistDetail);

// Update the detail of a stylist by sending param id
route.patch("/update/:id", stylistController.updateStylist);

// Get all the stylists from the database
route.get("/getAll/", stylistController.getAllStylists);

module.exports = route;