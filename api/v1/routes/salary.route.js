const express = require("express");
const salaryController = require("../controller/salary.controller");
const router = express.Router();

router.post("/create",(req,res)=>{res.send("ok")})

router.post("/newDaily",(req,res)=>{res.send("daily")})

router.get("/salary",(req,res)=>{res.send("salary")})

router.post("/dailySalary",salaryController.dailySalary);

router.get("/totalSalary",(req,res)=>{res.send("salary")})



module.exports = router;