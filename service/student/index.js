const output = require("../../utils/output")["results"];
const sqlInfo = require("../../tools/getInfo");
const getSemester = require("../../utils/getSemester");

module.exports = {
  studentNumberList: async (req, callback) => {
    try {
      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      SQLStr = "SELECT student_no FROM member WHERE semester = ?  ORDER BY student_no";
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
};
