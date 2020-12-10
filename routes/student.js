const router = require("express").Router();
const output = require("../utils/output")["router"];

const Student = require("../service/student");

router.get("/number", (req, res) => {
  Student.studentNumberList(req, (response) => {
    output(res, response);
  });
});

module.exports = router;
