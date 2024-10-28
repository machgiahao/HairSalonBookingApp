const authController = require("../controller/auth.controller")
const checkDuplicateMiddleware = require("../middleware/checkDuplicate.middleware");
const uploadCloudMiddleware = require("../middleware/uploadCloud.middleware");
const { verifyToken } = require("../middleware/verifyToken.middleware")
const route = require("express").Router();


route.post("/register", checkDuplicateMiddleware, uploadCloudMiddleware, authController.register);
route.post("/login", authController.login);
route.post("/refresh", authController.requestRefreshToken);
route.post("/logout", authController.logout);
route.post("/forgot-password", authController.forgotPassword);
route.post("/reset-password", authController.resetPassword);
route.use(verifyToken);
route.post("/change-password", authController.changePassword);

module.exports = route;






