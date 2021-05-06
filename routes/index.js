const router = require("express").Router();

router.use("/student", require("./student"));
router.use("/worktime", require("./worktime"));
router.use("/semester", require("./semester"));
router.use("/attendance", require("./attendance"));

module.exports = router;
