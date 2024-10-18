const authController = require("../controller/auth.controller")
const checkDuplicateMiddleware = require("../middleware/checkDuplicate.middleware");
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware");
const router = require("express").Router();


router.post("/register", checkDuplicateMiddleware, uploadCloudMiddleware, authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.requestRefreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);


module.exports = router;






