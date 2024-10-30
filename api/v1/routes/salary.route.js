const express = require("express");
const salaryController = require("../controller/salary.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = express.Router();

route.get("/getAll",salaryController.getAllDailySalary);
route.use(verifyToken);

route.use(checkRole("Staff"))
route.get("/generalMonthlySalary",salaryController.generalMonthlySalary);

route.use(checkRole("Stylist"))
route.post("/dailySalary",salaryController.dailySalary);

route.get("/monthlySalary",salaryController.monthlySalary);

route.use(checkRole("Manager"))

route.patch("/update",salaryController.updateSalary);






module.exports = route;