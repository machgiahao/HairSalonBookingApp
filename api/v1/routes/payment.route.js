const paymentController = require("../controller/payment.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();
const express = require("express");

route.get("/getAll", paymentController.getAll);
route.use(verifyToken);
route.get("/getDetail", paymentController.getDetail);

// route.use(checkRole("Stylist"));
route.post("/create", paymentController.create);

// route.use(checkRole("Manager", "Staff"));
route.post("/generateQR", paymentController.generateQR);
route.patch("/update", paymentController.update);
route.delete("/softDel", paymentController.softDel);
route.post("/create_payment_url", express.urlencoded({ extended: true }), verifyToken, checkRole("Staff"), paymentController.createPaymentUrl);
route.get("/return_url", verifyToken, checkRole("Staff"), paymentController.returnUrl);
route.get("/vnpay_ipn", verifyToken, checkRole("Staff"), paymentController.vnpayIpn);

module.exports = route;