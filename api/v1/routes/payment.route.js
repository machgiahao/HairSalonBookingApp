const paymentController = require("../controller/payment.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();
const express = require("express");

route.get("/getAll", paymentController.getAll);
route.use(verifyToken);
route.get("/getDetail", paymentController.getDetail);

route.use(checkRole("Stylist"));
route.post("/create", paymentController.create);

route.post("/create_payment_url", express.urlencoded({ extended: true }), verifyToken, checkRole("Staff"), paymentController.createPaymentUrl);
route.get("/return_url", verifyToken, checkRole("Staff"), paymentController.returnUrl);
route.get("/vnpay_ipn", verifyToken, checkRole("Staff"), paymentController.vnpayIpn);

route.use(checkRole("Manager", "Staff"));
route.patch("/update", paymentController.update);
route.delete("/softDel", paymentController.softDel);

module.exports = route;