const customerController = require("../controller/customer.controller");
const router = require("express").Router();
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

router.use(verifyToken);
router.get("/detail", customerController.detail);
router.patch("/update", uploadCloudMiddleware, customerController.update);
router.use(checkRole("Manager"));
router.delete("/delete", customerController.delete);
router.get("/getAll", customerController.getAll);


module.exports = router;
