import { validateNull } from './validate';
import _ from 'lodash';
import { setStore, getStore } from './store';
import Formula from '@hapi/formula';

/**
 * 验证表单
 *
 * @param {表单实例} form
 */
export const vaildForm = (form) => {
  let flag;
  form.validate((valid) => {
    flag = valid;
  });
  return flag;
};

export const serialize = (data) => {
  let list = [];
  Object.keys(data).forEach((ele) => {
    list.push(`${ele}=${data[ele]}`);
  });
  return list.join('&');
};

export const getObjType = (obj) => {
  var toString = Object.prototype.toString;
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };

  if (obj instanceof Element) {
    return 'element';
  }

  return map[toString.call(obj)];
};

export const formatObject = (data, expect) => {
  let type = getObjType(data);
  let expectType = getObjType(expect);
  if (type === 'null' || type === 'undefined') {
    return expect;
  }
  if (type === expectType) {
    return data;
  }
  if (type === 'string') {
    let newData;
    try {
      newData = unzipLayout(data);
    } catch (err) {
      console.log('非base64');
      newData = null;
    }
    let newType = getObjType(newData);
    if (newType === expectType) {
      return newData;
    }
  }
  return expect;
};

export const deepClone = (data) => {
  var type = getObjType(data);
  var obj;

  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    // 不再具有下一层次
    return data;
  }
  if (type === 'array') {
    for (var i = 0, len = data.length; i < len; i++) {
      obj.push(deepClone(data[i]));
    }
  } else if (type === 'object') {
    for (var key in data) {
      obj[key] = deepClone(data[key]);
    }
  }
  return obj;
};

/**
 * 判断路由是否相等
 */
export const diff = (obj1, obj2) => {
  delete obj1.close;
  var o1 = obj1 instanceof Object;
  var o2 = obj2 instanceof Object;
  if (!o1 || !o2) {
    /*  判断不是对象  */
    return obj1 === obj2;
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (var attr in obj1) {
    var t1 = obj1[attr] instanceof Object;
    var t2 = obj2[attr] instanceof Object;
    if (t1 && t2) {
      return diff(obj1[attr], obj2[attr]);
    } else if (obj1[attr] !== obj2[attr]) {
      return false;
    }
  }
  return true;
};
/**
 * 根据字典的value显示label
 */
export const findByValue = (dic, value) => {
  let result = '';
  if (validateNull(dic)) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    let index = 0;
    index = findArray(dic, value);
    if (index !== -1) {
      result = dic[index].label;
    } else {
      result = value;
    }
  } else if (value instanceof Array) {
    result = [];
    let index = 0;
    value.forEach((ele) => {
      index = findArray(dic, ele);
      if (index !== -1) {
        result.push(dic[index].label);
      } else {
        result.push(value);
      }
    });
    result = result.toString();
  }
  return result;
};
/**
 * 根据字典的value查找对应的index
 */
export const findArray = (dic, value) => {
  for (let i = 0; i < dic.length; i++) {
    if (dic[i].value === value) {
      return i;
    }
  }
  return -1;
};
/**
 * 根据URL返回  slug
 */
export const findSlug = (url, index = 2) => {
  const array = url.split('/');
  return array[index];
};

/**
 * @param stringOfObj 查找对象的路径 从子级开始， 以点区隔
 * @param obj 被查找的对象
 */
export const getObjValue = (stringOfObj, obj) => {
  if (validateNull(stringOfObj)) {
    return null;
  }
  if (validateNull(obj)) {
    return null;
  }
  const array = stringOfObj.split('.');
  if (validateNull(array)) {
    return null;
  }
  let tempObj = obj;
  let value = array.reduce(function(prev, cur) {
    let currentObj = getObjType(prev) === 'object' ? prev : getItemChildrenProp(prev, tempObj);
    let newObj = getItemChildrenProp(cur, currentObj);
    // console.log(newObj, currentObj, 'current level obj');
    return newObj;
  });
  return value;
};

export const detailDataType = (value, type) => {
  if (type === 'number') {
    return Number(value);
  } else if (type === 'string') {
    return value + '';
  } else {
    return value;
  }
};

/**
 * 根据字段数组排序
 */

export const vaildData = (val, dafult) => {
  if (typeof val === 'boolean') {
    return val;
  }
  return !validateNull(val) ? val : dafult;
};

export const getFormulaValue = (formulaItem, obj = {}) => {
  const reference = function(name) {
    return (context) => context[name];
  };
  const functions = {
    x: (value) => value.toFixed(2)
  };
  if (!formulaItem || !formulaItem.formulaElementJson || !formulaItem.formulaContent) {
    obj.formulaVauleResult = false;
    return obj;
  }
  let content = formulaItem.formulaContent.split('=')[0];
  let result = formulaItem.formulaContent.split('=')[1] || 'r';
  let type = getObjType(formulaItem.formulaElementJson);

  let list =
    type === 'array' ? formulaItem.formulaElementJson : JSON.parse(formulaItem.formulaElementJson);
  let calcObj = {};
  let resultField = 'price';

  list.map((item) => {
    calcObj[item.elementId] = obj[item.fieldName];
    if (item.elementId === result) {
      resultField = item.fieldName;
    }
  });

  const formula = new Formula.Parser(content, {
    reference,
    functions
  });
  let real = formula.evaluate(calcObj);
  obj[resultField] = real;
  obj.formulaVauleResult = true;
  console.log(real, '最终计算结果');
  return obj;
};

export const sortArrys = (list, prop) => {
  list.sort(function(a, b) {
    if (a[prop] > b[prop]) {
      return -1;
    }
    if (a[prop] < b[prop]) {
      return 1;
    }
    return 0;
  });
  return list;
};

/**
 * @param stringOfObj 查找对象的路径 从子级开始， 以点区隔
 * @param obj 被查找的对象
 */
export const checkObjExist = (stringOfObj, obj) => {
  if (validateNull(stringOfObj)) {
    return false;
  }
  if (validateNull(obj)) {
    return false;
  }
  const array = stringOfObj.split('.');
  if (validateNull(array)) {
    return false;
  }
  let tempObj = obj;
  let value = array.reduce(function(prev, cur) {
    let currentObj = getObjType(prev) === 'object' ? prev : getItemChildrenProp(prev, tempObj);
    let newObj = getItemChildrenProp(cur, currentObj);
    return newObj;
  });
  return !!value;
};

const getItemChildrenProp = (str, obj) => {
  if (validateNull(str)) {
    return null;
  }
  if (validateNull(obj)) {
    return null;
  }
  try {
    return str.includes('[') ? getItemFormArrayStr(str, obj) : obj[str];
  } catch (err) {
    console.log('error：' + str + '!!!' + err);
    return null;
  }
};

export const zipLayout = (jsonObj) => {
  return btoa(unescape(encodeURIComponent(JSON.stringify(jsonObj))));
};

export const unzipLayout = (jsonObjStr) => {
  let _atob = '';
  try {
    _atob = decodeURIComponent(escape(atob(jsonObjStr)));
  } catch (e) {
    _atob = jsonObjStr;
  }
  const projectObj = JSON.parse(_atob);
  console.log(projectObj, '解压缩数据');
  return projectObj;
};

export const getItemFormArrayStr = (str, obj) => {
  if (validateNull(obj)) {
    return null;
  }
  let array = str.split('[');
  let index = parseInt(array[1]);
  let newObj = obj[array[0]];
  if (validateNull(newObj)) {
    return null;
  }
  return newObj[index];
};

export function isJSON(str) {
  if (getObjType(str) !== 'string') {
    return false;
  }
  try {
    var obj = JSON.parse(str);
    return (getObjType(obj) === 'object' || getObjType(obj) === 'array') && obj;
  } catch (e) {
    console.log('error：' + str + '!!!' + e);
    return false;
  }
}

export const getDicItem = (action) => {
  let dicLib = getStore({ name: 'commondic' });
  if (dicLib && getObjType(dicLib) !== 'object') {
    dicLib = JSON.parse(dicLib);
  }
  if (dicLib) {
    let dic = dicLib[action];
    if (dic) {
      return dic;
    }
  } else {
    loadDic();
  }
  return [];
};

export const getFormulaItem = (action) => {
  let lib = getStore({ name: 'commonFormula' });
  if (lib && getObjType(lib) !== 'object') {
    lib = JSON.parse(lib);
  }
  if (lib) {
    let item = lib[action];
    if (item) {
      return item;
    }
  } else {
    loadFormula();
  }
  return [];
};

export const getTableItem = (action) => {
  let dicLib = getStore({ name: 'allTableColumn' });
  if (dicLib && getObjType(dicLib) !== 'object') {
    dicLib = JSON.parse(dicLib);
  }
  if (dicLib) {
    let dic = dicLib[action];
    if (dic) {
      return dic;
    }
  } else {
    loadAllTable();
  }
  return [];
};

export const getTemplateItem = async (type) => {
  let template = getStore({ name: type });
  if (template && getObjType(template) !== 'object') {
    template = JSON.parse(template);
  }
  if (template) {
    return template;
  } else {
    template = await loadTemplate(type);
    return template;
  }
};
export const loadFormula = () => {
  let filePath = 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/';
  let url = `${filePath}formula/index.json`;
  loadJson(url, 'commonFormula');
};

export const loadDic = () => {
  let filePath = 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/';
  let url = `${filePath}dic/index.json`;
  loadJson(url, 'commondic');
};

export const loadAllTable = () => {
  let filePath = 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/';
  let url = `${filePath}allTableColumn.json`;
  loadJson(url, 'allTableColumn');
};

export const loadTemplate = (type) => {
  let filePath = 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/template/';
  let url = `${filePath}${type}.json`;
  loadJson(url, type);
};

export const initJson = () => {
  loadAllTable();
  loadDic();
  loadFormula();
};

export const loadJson = (url, name) => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log('获取文件', url);
      setStore({ name, content: xhr.response });
    } else {
      console.log('获取文件失败', xhr.status, xhr.statusText);
      this.$message.error('获取文件失败', xhr.statusText);
    }
  };

  xhr.onerror = function() {
    console.log('获取文件失败', xhr.status, xhr.statusText);
    this.$message.error('获取文件失败', xhr.statusText);
  };
  xhr.send();
};

export const makeBlockOutputJson = (page) => {
  let outputJson = util._initComponentsList(page, page);
  const base64 = zipLayout(outputJson);
  return base64;
};
/**
 *
 * @param {*} remoteColumn 远程配置系统配置的column 属性
 * @param {*} localColum  本地附件修正的column 属性
 */
export const mergeColumn = (remoteColumn = [], localColum = []) => {
  // 以远程配置为基准
  let newColumn = remoteColumn;
  // 如果远程配置未定义，则直接添加到数组
  localColum.map((item) => {
    newColumn = newColumn.map((subitem) => {
      let newSubItem = subitem;
      if (subitem.prop === item.prop) {
        newSubItem = _.merge(subitem, item);
      }
      return newSubItem;
    });
    let isExist = newColumn.find((subitem) => {
      return subitem.prop === item.prop;
    });
    if (!isExist) {
      newColumn.push(item);
    }
  });
  return newColumn;
};

/**
 *
 * @param {所有的数据} data
 * @param {需要合并的列如：[1, 2]} arr
 * @param {通过该字段来区分哪些是要合并的} filed
 * @param {对比的id} id
 * @param {列数} columnIndex
 * @param {行数据} row
 */
export function mySpanMethod(data, arr, filed, id, columnIndex, row) {
  // 通过lodash中的groupBy方法将数据处理成，需要合并的排在一起。

  let itemArr = []; // 需要合并的数组。
  data.forEach((item) => {
    if (item[filed] === row[filed]) {
      itemArr.push(item);
    }
  });
  for (let i = 0; i < arr.length; i++) {
    if (columnIndex === arr[i]) {
      // itemArr第一项需要向下合并，其它的不需要。
      let rowFiled = row[filed];
      let itemFiled = itemArr[0][filed];
      let rid = row[id];
      let itemId = itemArr[0][id];
      if (rowFiled === itemFiled && rid === itemId) {
        return {
          rowspan: itemArr.length,
          colspan: 1
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
  }
}

export const formatDate = (date, fmt) => {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str));
    }
  }
  return fmt;
};
function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}

/// 格式化文件大小的JS方法
/// <param name="filesize">文件的大小,传入的是一个bytes为单位的参数</param>
/// <returns>格式化后的值</returns>
export const renderSize = (filesize) => {
  if (filesize === null || filesize === '') {
    return '0 Bytes';
  }
  const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let index = 0;
  const srcsize = parseFloat(filesize);
  index = Math.floor(Math.log(srcsize) / Math.log(1024));
  let size = srcsize / Math.pow(1024, index);
  size = size.toFixed(2); // 保留的小数位数
  return size + unitArr[index];
};

export const getAccount = () => {
  let userInfo = getStore({ name: 'userInfo', timer: 1200 }); // getStore 使用样例
  if (userInfo && userInfo.elsAccount) {
    return userInfo;
  }
  return {
    elsAccount: '',
    elsSubAccount: '',
    token: ''
  };
};

const util = {
  getAccount,
  formatDate,
  findSlug,
  getObjType,
  validateNull,
  formatObject,
  getObjValue,
  isJSON,
  zipLayout,
  unzipLayout,
  makeBlockOutputJson,
  mySpanMethod,
  renderSize
};

export default util;
