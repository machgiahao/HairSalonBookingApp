const guestController = require("../controller/guest.controller");
const router = require('express').Router();

router.post("/create", guestController.create);

module.exports = router;