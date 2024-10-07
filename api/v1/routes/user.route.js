const userController = require("../controller/user.controller")
const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken.middleware")

router.get("/getCurrent", verifyToken, userController.getCurrent);
router.get("/getAll", verifyToken , userController.getAll);

module.exports = router;

























