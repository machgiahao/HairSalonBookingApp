const express = require("express");
const salaryController = require("../controller/salary.controller");
const route = express.Router();

route.patch("/update",salaryController.updateSalary)

route.get("/generalMonthlySalary",salaryController.generalMonthlySalary)

route.get("/getAll",salaryController.getAllDailySalary)

route.post("/dailySalary",salaryController.dailySalary);

route.get("/monthlySalary",salaryController.monthlySalary)



module.exports = route;