const userController = require("../controller/user.controller")
const router = require("express").Router();
const { verifyToken, checkRole } = require("../middleware/verifyToken.middleware")

router.use(verifyToken);
router.get("/getCurrent", userController.getCurrent);
router.get("/getAll", checkRole("Manager") , userController.getAll);

module.exports = router;

























