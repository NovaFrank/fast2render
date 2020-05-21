import { validateNull } from './validate';
/**
 * 存储localStorage
 */
export const setStore = (params) => {
  let { name, content, type } = params;
  let obj = {
    dataType: typeof content,
    content: content,
    type: type,
    datetime: new Date().getTime()
  };
  if (type) {
    window.sessionStorage.setItem(name, JSON.stringify(obj));
  } else {
    window.localStorage.setItem(name, JSON.stringify(obj));
  }
};
/**
 * 获取localStorage
 */

export const getStore = (params) => {
  let { name, debug, timer } = params;
  let obj = {};
  let content;
  obj = window.sessionStorage.getItem(name);
  if (validateNull(obj)) {
    obj = window.localStorage.getItem(name);
  }
  if (validateNull(obj)) {
    return;
  }
  obj = JSON.parse(obj);
  if (debug) {
    return obj;
  }

  if (timer) {
    let current = new Date().getTime();
    let datatime = obj.datetime;
    let end = current - datatime;
    if (timer * 60 * 1000 < end) {
      removeStore({ name });
      return false;
    }
  }
  if (obj.dataType === 'string') {
    content = obj.content;
  } else if (obj.dataType === 'number') {
    content = Number(obj.content);
  } else if (obj.dataType === 'boolean') {
    // eslint-disable-next-line no-eval
    content = eval(obj.content);
  } else if (obj.dataType === 'object') {
    content = obj.content;
  }
  return content;
};
/**
 * 删除localStorage
 */
export const removeStore = (params) => {
  let { name } = params;
  window.localStorage.removeItem(name);
  window.sessionStorage.removeItem(name);
};

/**
 * 获取全部localStorage
 */
export const getAllStore = (params) => {
  let list = [];
  let { type } = params;
  for (let i = 1; i <= window.sessionStorage.length; i++) {
    if (type) {
      list.push({
        name: window.sessionStorage.key(i),
        content: getStore({
          name: window.sessionStorage.key(i),
          type: 'session'
        })
      });
    } else {
      list.push(
        getStore({
          name: window.localStorage.key(i),
          content: getStore({
            name: window.localStorage.key(i)
          })
        })
      );
    }
  }
  return list;
};

/**
 * 清空全部localStorage
 */
export const clearStore = (params) => {
  let { type } = params;
  if (type) {
    window.sessionStorage.clear();
    return;
  }
  window.localStorage.clear();
};
