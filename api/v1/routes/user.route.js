const userController = require("../controller/user.controller")
const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middleware/verifyToken.middleware")

router.get("/getCurrent", verifyToken, userController.getCurrent);
router.get("/getAll", verifyToken, isAdmin , userController.getAll);

module.exports = router;

























