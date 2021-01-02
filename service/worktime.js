const output = require("../utils/output")["results"];
const sqlInfo = require("../tools/getInfo");
const getSemester = require("../utils/getSemester");
const moment = require("moment");

module.exports = {
  // 新增學生服務時數
  newWorkTime: async (req, callback) => {
    try {
      const { query, body } = req;
      const { student_no = "", semester = "" } = query;
      const { work_date = "", start_time = 0, end_time = 0 } = body;

      // 判斷輸入
      if (
        student_no === "" ||
        semester === "" ||
        work_date === "" ||
        start_time === 0 ||
        end_time === 0
      ) {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // 確認時段無衝突
      SQLStr =
        "SELECT \
          count(*) as size \
        FROM worktime \
        WHERE student_no=? \
          AND semester=? \
          AND work_date=? \
          AND ((start_time<=? AND end_time>=?) OR (start_time<=? AND end_time>=?) OR (start_time>=? AND end_time<=?))";
      SQLData = await Promise.resolve(
        sqlInfo.SQLQuery(conn, SQLStr, [
          student_no,
          semester,
          work_date,
          start_time,
          start_time,
          end_time,
          end_time,
          start_time,
          end_time,
        ])
      );

      if (SQLData[0]["size"] !== 0) {
        output(callback, { code: 409 }, { conn });
        return;
      }

      // 新增學生服務時數
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

  // 取得學生服務時數列表
  getWorkTimeList: async (req, callback) => {
    try {
      const { query } = req;
      const { semester = "", student_no = "" } = query;

      // 判斷輸入
      if (semester === "" || student_no === "") {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      SQLStr =
        "SELECT \
          worktime.id, \
          work_date, \
          start_time, \
          end_time, \
          finished \
        FROM worktime \
        WHERE student_no=? \
          AND semester=? \
        ORDER BY work_date ASC, start_time ASC";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [student_no, semester]));

      output(
        callback,
        {
          code: 200,
          data: {
            size: SQLData.length,
            results: [...SQLData],
          },
        },
        { conn }
      );
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },

  // 更新學生服務時數
  updateWorkTime: async (req, callback) => {
    try {
      const { query, body } = req;
      const { id = 0 } = query;
      const { work_date = "", start_time = 0, end_time = 0 } = body;

      // 判斷輸入
      if (id === 0 || work_date === "" || start_time === 0 || end_time === 0) {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // 取得學號、學期
      SQLStr = "SELECT student_no, semester FROM worktime WHERE id=?";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [id]));
      if (SQLData.length !== 1) {
        output(callback, { code: 400 }, { conn });
        return;
      }

      const { student_no, semester } = SQLData[0];

      // 確認時段無衝突
      SQLStr =
        "SELECT \
          count(*) as size \
        FROM worktime \
        WHERE id!=? \
          AND student_no=? \
          AND semester=? \
          AND work_date=? \
          AND ((start_time<=? AND end_time>=?) OR (start_time<=? AND end_time>=?) OR (start_time>=? AND end_time<=?))";
      SQLData = await Promise.resolve(
        sqlInfo.SQLQuery(conn, SQLStr, [
          id,
          student_no,
          semester,
          work_date,
          start_time,
          start_time,
          end_time,
          end_time,
          start_time,
          end_time,
        ])
      );
      if (SQLData[0]["size"] !== 0) {
        output(callback, { code: 409 }, { conn });
        return;
      }

      // 定義修改的學生服務時數
      const updateQuery = {
        work_date: moment(work_date).format("YYYY-MM-DD"),
        start_time,
        end_time,
        finished: 1,
      };

      // 修改學生服務時數
      SQLStr = "UPDATE worktime SET ? WHERE id=?";
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

  // 刪除學生服務時數
  deleteWorkTime: async (req, callback) => {
    try {
      const { query } = req;
      const { id = 0 } = query;

      // 判斷輸入
      if (id === 0) {
        output(callback, { code: 400 });
        return;
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // 刪除學生服務時數
      SQLStr = "DELETE FROM worktime WHERE id=?";
      SQLFlag = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [id]));
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

  // 取得詳細服務時數
  getWorkTimeDetail: async (req, callback) => {
    try {
      const { query } = req;
      const { id = 0 } = query;

      // 判斷輸入
      if (id === 0) {
        output(callback, { code: 400 });
      }

      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      // 取得服務時數
      SQLStr =
        "SELECT \
          id, \
          work_date, \
          start_time, \
          end_time, \
          (end_time - start_time) as work_time, \
          finished \
        FROM worktime \
        WHERE id=?";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [id]));

      output(callback, { code: 200, data: { ...SQLData[0] } }, { conn });
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },
};
