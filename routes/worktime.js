const router = require("express").Router();
const output = require("../utils/output")["router"];

const Worktime = require("../service/worktime");

router
  .route("/")
  // 新增學生服務時數
  .post((req, res) => {
    Worktime.newWorkTime(req, (response) => {
      output(res, response);
    });
  })
  // 取得學生服務時數列表
  .get((req, res) => {
    Worktime.getWorkTimeList(req, (response) => {
      output(res, response);
    });
  })
  // 修改學生服務時數
  .put((req, res) => {
    Worktime.updateWorkTime(req, (response) => {
      output(res, response);
    });
  })
  .delete((req, res) => {
    Worktime.deleteWorkTime(req, (response) => {
      output(res, response);
    });
  });

module.exports = router;
