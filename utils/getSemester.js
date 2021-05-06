function getSemester(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // 計算學期
  const schoolYear = (month <= 7 ? year - 1 : year) - 1911;
  const semester = month >= 2 && month < 8 ? "-2" : "-1";

  return `${schoolYear}${semester}`;
}

module.exports = getSemester;
