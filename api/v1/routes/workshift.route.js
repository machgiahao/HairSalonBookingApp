const express = require("express");
const workshiftController = require("../controller/workshift.controller"); 
const route = express.Router();

// Route to create a new workship
route.post("/create", workshiftController.create);

//
route.post("/addStylist", workshiftController.addStylistToWorkShift);


// Route to get all workships
route.get("/getAll", workshiftController.getAll);

// Route to get all workships of stylist
route.get("/getWorkshfit", workshiftController.getAllWorkshift);

// Route to get the details of a specific workship by ID
route.get("/detail", workshiftController.detail);

// Route to soft delete a workship by ID
route.delete("/softDel", workshiftController.softDel);

// Route to update a workship by ID
route.patch("/update", workshiftController.update);

//Remove stylist out of workshift
route.delete("/removeStylist", workshiftController.removeStylistFromWorkShift);


// Export the routes for use in other parts of the application
module.exports = route;
