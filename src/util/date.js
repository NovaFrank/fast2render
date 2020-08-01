export const calcDate = (date1, date2) => {
  var date3 = date2 - date1;

  var days = Math.floor(date3 / (24 * 3600 * 1000));

  var leave1 = date3 % (24 * 3600 * 1000); // 计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000));

  var leave2 = leave1 % (3600 * 1000); // 计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000));

  var leave3 = leave2 % (60 * 1000); // 计算分钟数后剩余的毫秒数
  var seconds = Math.round(date3 / 1000);
  return {
    leave1,
    leave2,
    leave3,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
};

/**
 * 将时间戳转换为UTC
 * @param { 时间戳 } t
 */
export const utcFormat = (t) => {
  const tt = new Date(t);
  const y = tt.getUTCFullYear();
  const m = tt.getUTCMonth();
  const d = tt.getUTCDate();
  const h = tt.getUTCHours();
  const M = tt.getUTCMinutes();
  const s = tt.getUTCSeconds();
  return Date.UTC(y, m, d, h, M, s);
};

export const formatDate = (date, fmt) => {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str));
    }
  }
  return fmt;
};
function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}
