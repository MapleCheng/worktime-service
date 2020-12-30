const router = require("express").Router();
const output = require("../utils/output")["router"];

const Student = require("../service/student");

// 取得學號列表
router.get("/number", (req, res) => {
  Student.getStudentNumberList(req, (response) => {
    output(res, response);
  });
});

// 取得學生資訊
router.get("/info", (req, res) => {
  Student.getStudentInfo(req, (response) => {
    output(res, response);
  });
});

// 取得學生詳細資訊
router.get("/detail", (req, res) => {
  Student.getStudentDetail(req, (response) => {
    output(res, response);
  });
});

router
  .route("/")
  // 新增學生
  .post((req, res) => {
    Student.newStudent(req, (response) => {
      output(res, response);
    });
  })
  // 取得學生列表
  .get((req, res) => {
    Student.getStudentList(req, (response) => {
      output(res, response);
    });
  })
  // 修改學生資料
  .put((req, res) => {
    Student.updateStudent(req, (response) => {
      output(res, response);
    });
  })
  // 刪除學生資料
  .delete((req, res) => {
    Student.deleteStudent(req, (response) => {
      output(res, response);
    });
  });

router
  .route("/extends")
  // 取得前學期學生列表
  .get((req, res) => {
    Student.getOldStudentList(req, (response) => {
      output(res, response);
    });
  })
  // 繼承學生
  .post((req, res) => {
    Student.extendsStudent(req, (response) => {
      output(res, response);
    });
  });

module.exports = router;
