const feedbackController = require("../controller/feedback.controller");
const { verifyToken } = require("../middleware/verifyToken.middleware");
const route = require('express').Router();

route.get("/detail", feedbackController.detail);
route.get("/getAll", feedbackController.getAll);
route.use(verifyToken)
route.post("/create", feedbackController.create);
route.patch("/update", feedbackController.update);
route.delete("/delete", feedbackController.delete);

module.exports = route;