const serviceController = require("../controller/service.controller");
const router = require("express").Router();
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware")

router.get("/detail", serviceController.detail);
router.get("/getAll", serviceController.getAll);
router.use(verifyToken);
router.use(checkRole("Manager"));
router.post("/create", uploadCloudMiddleware, serviceController.create);
router.patch("/update", uploadCloudMiddleware, serviceController.update);
router.delete("/delete", serviceController.delete);



module.exports = router;