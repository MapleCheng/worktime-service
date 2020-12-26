const output = require("../utils/output")["results"];
const sqlInfo = require("../tools/getInfo");
const getSemester = require("../utils/getSemester");
const moment = require("moment");

module.exports = {
  // 取得簽到狀態
  getAttendanceType: async (req, callback) => {
    try {
      const { query } = req;
      const { student_no = "" } = query;

      // 判斷輸入
      if (student_no === "") {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      SQLStr =
        "SELECT count(*) as size FROM worktime WHERE semester = ? AND student_no=? AND work_date=? AND finished=?";
      SQLData = await Promise.resolve(
        sqlInfo.SQLQuery(conn, SQLStr, [getSemester(), student_no, moment().format("YYYY-MM-DD"), 0])
      );

      output(
        callback,
        {
          code: 200,
          data: {
            attendanceType: SQLData[0]["size"] === 0 ? true : false,
          },
        },
        { conn }
      );
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },

  // 學生簽到/簽退
};
