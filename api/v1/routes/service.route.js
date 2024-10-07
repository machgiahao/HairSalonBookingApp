const serviceController = require("../controller/service.controller");
const router = require("express").Router();

router.get("/getAll", serviceController.getAll);

module.exports = router;