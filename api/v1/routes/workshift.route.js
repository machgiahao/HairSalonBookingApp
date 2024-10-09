const express = require("express");
const workShipController = require("../controller/workshift.controller"); 
const route = express.Router();

// Route to create a new workship
route.post("/create", workShipController.create);

route.post("/addStylist", workShipController.addStylistToWorkShift);


// Route to get all workships
route.get("/getAll", workShipController.getAll);

// Route to get the details of a specific workship by ID
route.get("/detail/:id", workShipController.detail);

// Route to soft delete a workship by ID
route.delete("/softDel/:id", workShipController.softDel);

// Route to update a workship by ID
route.patch("/update/:id", workShipController.update);

//
route.delete("/removeStylist", workShipController.removeStylistFromWorkShift);


// Export the routes for use in other parts of the application
module.exports = route;
