const authController = require("../controller/auth.controller")

const router = require("express").Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.requestRefreshToken);
// router.post("/changePassword", authController.changePassword);


module.exports = router;






