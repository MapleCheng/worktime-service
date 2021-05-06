const router = require("express").Router();
const output = require("../utils/output")["router"];

const Attendance = require("../service/attendance");

router
  .route("/")
  // 取得簽到狀態
  .get((req, res) => {
    Attendance.getAttendanceType(req, (response) => {
      output(res, response);
    });
  })
  .patch((req, res) => {
    Attendance.onAttendance(req, (response) => {
      output(res, response);
    });
  });

module.exports = router;
