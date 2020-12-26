const router = require("express").Router();
const output = require("../utils/output")["router"];

const Worktime = require("../service/worktime");

router
  .route("/")
  // 新增時數
  .post((req, res) => {
    Worktime.newWorkTime(req, (response) => {
      output(res, response);
    });
  });

module.exports = router;
