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
        { conn }
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
        { conn }
      );
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },
  // 新增學生
  newStudent: async (req, callback) => {
    const { query } = req;
    const { student_name = "", class_name = "", student_no = "", semester = "" } = query;

    let { total_h, total_m } = query;

    total_h = parseInt(total_h) || 0;
    total_m = parseInt(total_m) || 0;

    const total_time = total_h * 60 + total_m || 0;

    // 判斷輸入
    if (student_name === "" || class_name === "" || student_no === "" || semester === "") {
      output(callback, { code: 400 });
      return;
    }
    if (student_no.length !== 10) {
      output(callback, { code: 400 });
      return;
    }

    // connection SQL
    const conn = sqlInfo.conn("worktime");
    let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

    // 判斷資料庫內是否有該學生
    SQLStr = "SELECT count(*) as size FROM student WHERE student_no = ? AND semester = ?";
    SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [student_no, semester]));
    if (SQLData[0]["size"] !== 0) {
      output(callback, { code: 409 }, { conn });
      return;
    }

    // 新增學生
    SQLStr = "INSERT INTO student(student_name, class_name, student_no, semester, total_time) VALUES (?, ?, ?, ?, ?)";
    SQLFlag = await Promise.resolve(
      sqlInfo.SQLQuery(conn, SQLStr, [student_name, class_name, student_no, semester, total_time])
    );
    if (!SQLFlag) {
      output(callback, { code: 403 }, { conn });
      return;
    }

    output(callback, { code: 201 }, { conn });
  },
  // 取得學生列表
  getStudentList: async (req, callback) => {
    const { query } = req;
    const { semester = getSemester() } = query;

    // connection SQL
    const conn = sqlInfo.conn("worktime");
    let [SQLStr, SQLData] = ["", []];

    SQLStr =
      "SELECT \
        s.id, \
        s.student_no, \
        s.class_name, \
        s.student_name, \
        sum(w.end_time - w.start_time) as working_minutes, \
        s.total_time - sum(w.end_time - w.start_time) as remaining_minutes, \
        s.total_time  as total_minutes \
      FROM student s, worktime w \
      WHERE s.student_no = w.student_no \
        AND s.semester = w.semester \
        AND s.semester = ? \
      GROUP BY student_no \
      ORDER BY student_no ASC";
    SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [semester]));

    output(
      callback,
      {
        code: 200,
        data: {
          semester,
          student_list: [...SQLData],
        },
      },
      { conn }
    );
  },
};
