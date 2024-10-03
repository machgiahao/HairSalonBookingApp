const customerController = require("../../controller/customer/customer.controller");
const router = require("express").Router();

router.get("/detail/:id", customerController.detail)


module.exports = router;
