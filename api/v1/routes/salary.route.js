const express = require("express");
const salaryController = require("../controller/salary.controller");
const router = express.Router();

router.patch("/update",salaryController.updateSalary)

router.get("/generalMonthlySalary",salaryController.generalMonthlySalary)

router.get("/getAll",salaryController.getAllDailySalary)

router.post("/dailySalary",salaryController.dailySalary);

router.get("/monthlySalary",salaryController.monthlySalary)



module.exports = router;