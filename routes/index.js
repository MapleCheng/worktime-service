const router = require("express").Router();

router.use("/student", require("./student"));
router.use("/worktime", require("./worktime"));

module.exports = router;
