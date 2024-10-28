const express = require("express");
const workshiftController = require("../controller/workshift.controller"); 
const { verifyToken } = require("../middleware/verifyToken.middleware");
const route = express.Router();

// Route to create a new workship
route.use(verifyToken);
route.post("/create", workshiftController.create);

//
route.post("/addStylist", workshiftController.addStylistToWorkShift);

// Route to get all workships
route.get("/getAll", workshiftController.getAll);

// Route to get all workships of tylist
route.get("/getWorkshift", workshiftController.getAllWorkshift);

// Route to get all workships of stylist include details
route.get("/getWorkshiftDetail", workshiftController.getAllWorkshiftDetail);

// Route to get the details of a specific workship by ID
route.get("/detail", workshiftController.detail);

// Route to soft delete a workship by ID
route.delete("/softDel", workshiftController.softDel);

// Route to update a workship by ID
route.patch("/update", workshiftController.update);

//update shift of stylist status
route.patch("/updateStatus", workshiftController.updateStylistWorkshift);

//Remove stylist out of workshift
route.delete("/removeStylist", workshiftController.removeStylistFromWorkShift);


// Export the routes for use in other parts of the application
module.exports = route;
