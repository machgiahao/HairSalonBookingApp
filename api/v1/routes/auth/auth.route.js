const authController = require("../../controller/auth/auth.controller")

const router = require("express").Router();

router.post("/register", authController);

module.exports = router;






