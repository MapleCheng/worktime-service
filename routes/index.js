const router = require("express").Router();

router.use("/student", require("./student"));
router.use("/worktime", require("./worktime"));
router.use("/semester", require("./semester"));

module.exports = router;
