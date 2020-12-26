const output = require("../utils/output")["results"];
const sqlInfo = require("../tools/getInfo");
const getSemester = require("../utils/getSemester");

module.exports = {
  // 取得學期列表
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
