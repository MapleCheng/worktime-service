const output = require("../utils/output")["results"];
const sqlInfo = require("../tools/getInfo");
const getSemester = require("../utils/getSemester");

module.exports = {
  // 取得學號列表
  getStudentNumberList: async (req, callback) => {
    try {
      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      SQLStr = "SELECT student_no FROM student WHERE semester = ?  ORDER BY student_no";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [getSemester()]));

      output(
        callback,
        {
          code: 200,
          data: {
            size: SQLData.length,
            results: SQLData,
          },
        },
        conn
      );
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },
  // 取得學生詳情資訊
  getStudentDetail: async (req, callback) => {
    try {
      const { query } = req;
      const { student_no = "" } = query;

      if (student_no === "") {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // student detail
      SQLStr =
        "SELECT  \
          s.student_name, \
          s.student_no, \
          s.class_name, \
          s.total_time - sum(w.end_time - w.start_time) as remaining_time \
        FROM student s, worktime w \
        WHERE s.student_no = w.student_no \
          AND s.semester = w.semester \
          AND s.semester = ? \
          AND s.student_no = ?";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [getSemester(), student_no]));

      output(
        callback,
        {
          code: 200,
          data: {
            ...SQLData[0],
          },
        },
        conn
      );
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },
};
