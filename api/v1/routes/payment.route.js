const paymentController = require("../controller/payment.controller");
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware");
const route = require("express").Router();
const express = require("express");

// Tuyến không yêu cầu xác thực
route.get("/getAll", paymentController.getAll);
// verifyToken
route.get("/getDetail", verifyToken, paymentController.getDetail);
// verifyToken + stylist
route.post("/create", verifyToken, checkRole("Stylist"), paymentController.create);
// verifyToken + staff
route.post(
    "/create_payment_url",
    express.urlencoded({ extended: true }),
    verifyToken,
    checkRole("Staff"),
    paymentController.createPaymentUrl
);
route.get("/return_url", verifyToken, checkRole("Staff"), paymentController.returnUrl);
route.get("/vnpay_ipn", verifyToken, checkRole("Staff"), paymentController.vnpayIpn);
// verifyToken + staff & manager
route.patch("/update", verifyToken, checkRole("Manager", "Staff"), paymentController.update);
route.delete("/softDel", verifyToken, checkRole("Manager", "Staff"), paymentController.softDel);

module.exports = route;
