const router = require("express").Router();
const output = require("../utils/output")["router"];

const Semester = require("../service/semester");

// 取得現在學期
router.get("/now", (req, res) => {
  Semester.getNowSemester(req, (response) => {
    output(res, response);
  });
});

router
  .route("/")
  // 取得學期列表
  .get((req, res) => {
    Semester.getSemesterList(req, (response) => {
      output(res, response);
    });
  });

module.exports = router;
