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

      SQLStr = "SELECT student_no FROM student WHERE semester = ? GROUP BY student_no ORDER BY student_no";
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

  // 取得學生資訊
  getStudentInfo: async (req, callback) => {
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
        "SELECT s.student_name, \
          s.student_no, \
          s.class_name, \
          s.total_time - COALESCE(sum(w.end_time - w.start_time), 0) as remaining_time \
        FROM student s \
        LEFT OUTER JOIN worktime w ON w.student_no = s.student_no AND w.semester = s.semester \
        WHERE s.semester = ? AND s.student_no = ?";
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

  // 取得學生詳細資訊
  getStudentDetail: async (req, callback) => {
    try {
      const { query } = req;
      const { semester, student_no = "" } = query;

      if (student_no === "") {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // student detail
      SQLStr =
        "SELECT s.id, \
          s.student_name, \
          s.student_no, \
          s.semester, \
          s.class_name, \
          s.total_time as total_minutes, \
          s.total_time - COALESCE(sum(w.end_time - w.start_time), 0) as remaining_time \
        FROM student s \
        LEFT OUTER JOIN worktime w ON w.student_no = s.student_no AND w.semester = s.semester \
        WHERE s.semester = ? AND s.student_no = ?";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [semester, student_no]));

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
    try {
      const { body } = req;
      const { student_name = "", class_name = "", student_no = "", semester = "" } = body;

      // 計算總時數
      let { total_h, total_m } = body;
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
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },

  // 取得學生列表
  getStudentList: async (req, callback) => {
    try {
      const { query } = req;
      const { semester = getSemester() } = query;

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      SQLStr =
        "SELECT \
          s.id, \
          s.student_no, \
          s.class_name, \
          s.student_name, \
          COALESCE(sum(w.end_time - w.start_time), 0) as working_minutes, \
          s.total_time - COALESCE(sum(w.end_time - w.start_time), 0) as remaining_minutes, \
          s.total_time  as total_minutes \
        FROM student s \
        LEFT OUTER JOIN worktime w ON w.student_no = s.student_no AND w.semester = s.semester \
        WHERE s.semester = ? \
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
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },

  // 修改學生資料
  updateStudent: async (req, callback) => {
    try {
      const { query, body } = req;
      const { id = 0 } = query;
      const { student_name = "", class_name = "", student_no = "" } = body;

      // 計算總時數
      let { total_h, total_m } = body;
      total_h = parseInt(total_h) || 0;
      total_m = parseInt(total_m) || 0;
      const total_time = total_h * 60 + total_m || 0;

      // 判斷輸入
      if (id === 0 || student_name === "" || class_name === "" || student_no === "") {
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

      // 設定更新的學生資料
      const updateQuery = {
        student_name,
        class_name,
        student_no,
        total_time,
      };

      // 更新學生資料
      SQLStr = "UPDATE student SET ? WHERE id = ?";
      SQLFlag = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [updateQuery, id]));
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

  // 刪除學生資料
  deleteStudent: async (req, callback) => {
    try {
      const { query } = req;
      const { id = 0 } = query;

      if (id === 0) {
        output(callback, { code: 400 }, { conn });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // 查詢欲刪除的學生
      SQLStr = "SELECT semester, student_no FROM student WHERE id=?";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [id]));
      if (SQLData.length !== 1) {
        output(callback, { code: 410 }, { conn });
        return;
      }

      const { semester, student_no } = SQLData[0];

      // 刪除學生的時數
      SQLStr = "DELETE FROM worktime WHERE semester=? AND student_no=?";
      SQLFlag = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [semester, student_no]));
      if (!SQLFlag) {
        output(callback, { code: 403 }, { conn });
        return;
      }

      // 刪除學生
      SQLStr = "DELETE FROM student WHERE semester=? AND student_no=?";
      SQLFlag = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [semester, student_no]));
      if (!SQLFlag) {
        output(callback, { code: 403 }, { conn });
        return;
      }

      output(callback, { code: 204 }, { conn });
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },

  // 取得前學期學生列表
  getOldStudentList: async (req, callback) => {
    try {
      const { query } = req;
      const { semester = "" } = query;

      if (semester === "") {
        output(callback, { code: 400 }, { conn });
        return;
      }

      // 取得前學期
      const semester_str = semester.split("-");
      const old_semester =
        parseInt(semester_str[1]) === 1 ? `${parseInt(semester_str[0]) - 1}-2` : `${parseInt(semester_str[0])}-1`;

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData] = ["", []];

      // 取得前學期之學生列表
      SQLStr =
        "SELECT \
          s.id, \
          s.student_no, \
          s.class_name, \
          s.student_name, \
          COALESCE(sum(w.end_time - w.start_time), 0) as working_minutes, \
          s.total_time - COALESCE(sum(w.end_time - w.start_time), 0) as remaining_minutes, \
          s.total_time  as total_minutes \
        FROM \
          student s \
        LEFT OUTER JOIN worktime w ON w.student_no = s.student_no AND w.semester = s.semester \
        WHERE \
          s.semester=? \
          AND s.student_no NOT IN (SELECT student_no FROM student WHERE semester=?) \
        GROUP BY student_no \
        ORDER BY student_no ASC";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [old_semester, semester]));

      output(
        callback,
        {
          code: 200,
          data: { semester: old_semester, size: SQLData.length, results: [...SQLData] },
        },
        { conn }
      );
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },

  // 繼承學生
  extendsStudent: async (req, callback) => {
    try {
      const { query } = req;
      const { id = 0, semester = "" } = query;

      if (id === 0 || semester === "") {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // 取得前學期學生資料
      SQLStr = "SELECT * FROM student WHERE id=?";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [id]));
      if (SQLData.length !== 1) {
        output(callback, { code: 403 }, { conn });
        return;
      }

      // 提取前學期學生資料
      const { student_name, class_name, student_no, total_time } = SQLData[0];

      // 確認是否已被繼承
      SQLStr = "SELECT count(*) as size FROM student WHERE student_no=? AND semester=?";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [student_no, semester]));
      if (SQLData[0]["size"] !== 0) {
        output(callback, { code: 409 }, { conn });
        return;
      }

      // 將學生資料新增至本學期
      SQLStr = "INSERT INTO student(student_name, class_name, student_no, total_time, semester) VALUES (?, ?, ?, ?, ?)";
      SQLFlag = await Promise.resolve(
        sqlInfo.SQLQuery(conn, SQLStr, [student_name, class_name, student_no, total_time, semester])
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
