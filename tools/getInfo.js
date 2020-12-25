const mysql = require("mysql");

const SQL_HOST = "localhost";
const SQL_USER = "root";
const SQL_PASS = "maple";

const databases = {
  worktime: "worktime",
};

// 取得SQL資訊
_dbInfo = (db) => ({
  host: SQL_HOST,
  user: SQL_USER,
  password: SQL_PASS,
  database: databases[db],
});

module.exports = {
  conn: (db) => {
    const conn = mysql.createConnection(_dbInfo(db));
    return conn;
  },
  SQLQuery: (conn, Query, Insert) => {
    return new Promise((resolve, reject) => {
      conn.query(Query, Insert, (err, results, fields) => {
        if (err) throw err;
        resolve(results);
      });
    });
  },
};
