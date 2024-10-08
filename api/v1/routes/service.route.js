const serviceController = require("../controller/service.controller");
const router = require("express").Router();

router.get("/detail/:id", serviceController.detail);
router.get("/getAll", serviceController.getAll);
router.post("/create", serviceController.create);
router.patch("/update/:id", serviceController.update);
router.delete("/delete/:id", serviceController.delete);



module.exports = router;