const output = require("../utils/output")["results"];
const sqlInfo = require("../tools/getInfo");
const getSemester = require("../utils/getSemester");
const moment = require("moment");

module.exports = {
  newWorkTime: async (req, callback) => {
    try {
      const { query, body } = req;
      const { student_no = "", semester = "" } = query;
      const { work_date = "", start_time = 0, end_time = 0 } = body;

      // 判斷輸入
      if (student_no === "" || semester === "" || work_date === "" || start_time === 0 || end_time === 0) {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];
      SQLStr =
        "SELECT \
          count(*) as size \
        FROM worktime \
        WHERE student_no=? \
          AND semester=? \
          AND work_date=? \
          AND ((start_time<=? AND end_time>=?) OR (start_time<=? AND end_time>=?))";
      SQLData = await Promise.resolve(
        sqlInfo.SQLQuery(conn, SQLStr, [student_no, semester, work_date, start_time, start_time, end_time, end_time])
      );

      if (SQLData[0]["size"] !== 0) {
        output(callback, { code: 409 }, { conn });
        return;
      }

      SQLStr =
        "INSERT INTO worktime(semester, student_no, work_date, start_time, end_time, finished) VALUES(?, ?, ?, ?, ?, ?)";
      SQLFlag = await Promise.resolve(
        sqlInfo.SQLQuery(conn, SQLStr, [
          semester,
          student_no,
          moment(work_date).format("YYYY-MM-DD"),
          start_time,
          end_time,
          1,
        ])
      );
      if (!SQLFlag) {
        output(callback, { code: 403 }, { conn });
        return;
      }

      output(callback, { code: 201 }, { conn });
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },
};
