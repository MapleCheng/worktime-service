const output = require("../utils/output")["results"];
const sqlInfo = require("../tools/getInfo");
const getSemester = require("../utils/getSemester");

module.exports = {
  // 取得學期列表
  getSemesterList: async (req, callback) => {
    try {
      // connection SQL
      const conn = sqlInfo.conn("worktime");
      let [SQLStr, SQLData, SQLFlag] = ["", [], undefined];

      SQLStr = "SELECT semester FROM student GROUP BY semester ORDER BY semester";
      SQLData = await Promise.resolve(sqlInfo.SQLQuery(conn, SQLStr, [getSemester()]));

      const semester_list = SQLData.map((item) => {
        return item.semester;
      });

      if (semester_list.indexOf(getSemester()) === -1) {
        semester_list.push(getSemester());
      }

      output(callback, { code: 200, data: { results: [...semester_list] }, conn });
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },

  // 取得現在學期
  getNowSemester: async (req, callback) => {
    try {
      output(callback, { code: 200, data: { semester: getSemester() } });
    } catch (err) {
      output(callback, { code: 500 });
      throw err;
    }
  },
};
