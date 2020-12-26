const router = require("express").Router();
const output = require("../utils/output")["router"];

const Semester = require("../service/semester");

router.get("/now", (req, res) => {
  Semester.getNowSemester(req, (response) => {
    output(res, response);
  });
});

module.exports = router;
