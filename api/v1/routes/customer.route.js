const customerController = require("../controller/customer.controller");
const router = require("express").Router();

router.get("/detail", customerController.detail)
router.patch("/update", customerController.update)
router.delete("/delete", customerController.delete)
router.get("/getAll", customerController.getAll)


module.exports = router;
