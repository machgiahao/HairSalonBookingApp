const userController = require("../controller/user.controller")
const router = require("express").Router();

router.get("/getAll", userController.getAll);

module.exports = router;

























