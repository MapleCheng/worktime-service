const codeMessage = {
  200: "服務器成功返回請求的數據。",
  201: "新建或修改數據成功。",
  202: "一個請求已經進入後台隊列（異步任務）。",
  204: "刪除數據成功。",
  400: "發出的請求有錯誤，服務器沒有進行新建或修改數據的操作。",
  401: "用戶沒有權限（令牌，用戶名，密碼錯誤）。",
  403: "用戶得到授權，但是訪問是被禁止的。",
  404: "發出的請求針對的是不存在的記錄，服務器沒有進行操作。",
  406: "請求的格式不可得。",
  409: "數據重複。",
  410: "請求的資源被永久刪除，且不會再得到的。",
  422: "當創造一個對象時，發生一個驗證錯誤。",
  500: "服務器發生錯誤，請檢查服務器。",
  502: "網關錯誤。",
  503: "服務不可用，服務器暫時過度或維護。",
  504: "網關超時。",
};

module.exports = {
  /**
   * @param  {func} callback
   * @param  {any} response
   * @param  {any} config
   */
  results: (callback = () => {}, response = {}, config = {}) => {
    const { conn } = config;

    // sql.end()
    try {
      if (Object.keys(config).indexOf("conn") > -1) {
        conn.end();
      }
    } catch (e) {
      callback({
        code: 500,
        message: codeMessage[500],
      });
      return false;
    }

    // output定義
    try {
      const { code, message, data } = response;
      callback({
        code,
        message: message || codeMessage[code],
        data,
      });
      return true;
    } catch (e) {
      callback({
        code: 500,
        message: codeMessage[500],
      });
      return false;
    }
  },
  router: (res, response) => {
    // res.status(response.status);
    res.json(response);
    res.end();
    return;
  },
};
