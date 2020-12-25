const router = require("express").Router();
const output = require("../utils/output")["router"];

const Student = require("../service/student");

// 取得學號列表
router.get("/number", (req, res) => {
  Student.getStudentNumberList(req, (response) => {
    output(res, response);
  });
});

// 取得學生詳細資訊
router.get("/detail", (req, res) => {
  Student.getStudentDetail(req, (response) => {
    output(res, response);
  });
});

module.exports = router;
