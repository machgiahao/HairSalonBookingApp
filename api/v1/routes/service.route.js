const serviceController = require("../controller/service.controller");
const router = require("express").Router();

router.get("/detail", serviceController.detail);
router.get("/getAll", serviceController.getAll);
router.patch("/update", serviceController);
router.delete("/delete", serviceController.delete);
router.post("/create", serviceController);



module.exports = router;