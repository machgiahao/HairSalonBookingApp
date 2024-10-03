const customerController = require("../../controller/customer/customer.controller");
const router = require("express").Router();

router.get("/detail/:id", customerController.detail)
router.patch("/update/:id", customerController.update)
router.delete("/delete/:id", customerController.delete)


module.exports = router;
