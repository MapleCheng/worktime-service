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

      // 確認出勤狀態
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
            datetime: new Date(),
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
  onAttendance: async (req, callback) => {
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

      // 確認出勤狀態
      SQLStr =
        "SELECT count(*) as size FROM worktime WHERE semester = ? AND student_no=? AND work_date=? AND finished=?";
      SQLData = await Promise.resolve(
        sqlInfo.SQLQuery(conn, SQLStr, [getSemester(), student_no, moment().format("YYYY-MM-DD"), 0])
      );

      const attendanceType = SQLData[0]["size"];
      const work_date = moment().format("YYYY-MM-DD");
      const now_time = parseInt(moment().format("H")) * 60 + parseInt(moment().format("m"));

      if (attendanceType === 0) {
        // 簽到
        SQLStr =
          "INSERT INTO worktime(semester, student_no, work_date, start_time, end_time, finished) VALUES(?, ?, ?, ?, ?, ?)";
        SQLFlag = await Promise.resolve(
          sqlInfo.SQLQuery(conn, SQLStr, [
            getSemester(),
            student_no,
            moment(work_date).format("YYYY-MM-DD"),
            now_time,
            now_time,
            0,
          ])
        );
      } else {
        // 簽退
        const updateQuery = {
          end_time: now_time,
          finished: 1,
        };
        SQLStr = "UPDATE worktime SET ? WHERE work_date=? AND student_no=? AND finished=?";
        SQLFlag = await Promise.resolve(
          sqlInfo.SQLQuery(conn, SQLStr, [updateQuery, moment(work_date).format("YYYY-MM-DD"), student_no, 0])
        );
      }

      output(
        callback,
        {
          code: 201,
          data: {
            attendanceType,
            datetime: new Date(),
            today: work_date,
            nowtime: now_time,
          },
        },
        { conn }
      );
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },
};
