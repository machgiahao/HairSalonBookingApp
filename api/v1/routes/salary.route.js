const express = require("express");
const salaryController = require("../controller/salary.controller");
const router = express.Router();

router.post("/create",(req,res)=>{res.send("ok")})

router.post("/newDaily",(req,res)=>{res.send("daily")})

router.get("/getAll",salaryController.getAllDailySalary)

router.post("/dailySalary",salaryController.dailySalary);

router.get("/monthlySalary",salaryController.monthlySalary)



module.exports = router;