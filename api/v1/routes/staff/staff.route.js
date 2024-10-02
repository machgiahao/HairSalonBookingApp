const express = require("express");
const route = express.Router();

//get the detail from staff by send param id
route.get("/detail/:id",(req,res)=>{res.send("detail")});

//update the detail from staff by send param id
route.get("/update/:id",(req,res)=>{res.send("update")});

//get all the staff from database
route.get("/getAll/",(req,res)=>{res.send("getAll")});

module.exports = route;