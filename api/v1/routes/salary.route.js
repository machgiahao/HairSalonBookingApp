const express = require("express");
const salaryController = require("../controller/salary.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = express.Router();

route.use(verifyToken);
route.use(checkRole("Stylist"))
route.post("/dailySalary",salaryController.dailySalary);

route.get("/monthlySalary",salaryController.monthlySalary);

route.get("/generalMonthlySalary",salaryController.generalMonthlySalary);
route.use(checkRole("Manager"))

route.patch("/update",salaryController.updateSalary);


route.get("/getAll",salaryController.getAllDailySalary);




module.exports = route;