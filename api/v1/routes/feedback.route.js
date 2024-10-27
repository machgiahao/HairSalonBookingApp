const feedbackController = require("../controller/feedback.controller");
const router = require('express').Router();

router.post("/create", feedbackController.create);

module.exports = router;