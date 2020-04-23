import { validateNull } from './validate';

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
  if (type === 'null' || type === 'undefined') return expect;
  if (type === expectType) return data;
  if (type === 'string') {
    let newData;
    try {
      newData = unzipLayout(data);
    } catch (err) {
      console.log('非base64');
      newData = null;
    }
    let newType = getObjType(newData);
    if (newType === expectType) return newData;
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
  if (validateNull(dic)) return value;
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
  if (validateNull(stringOfObj)) return null;
  if (validateNull(obj)) return null;
  const array = stringOfObj.split('.');
  if (validateNull(array)) return null;
  let tempObj = obj;
  let value = array.reduce(function(prev, cur, index, arr) {
    let currentObj = getObjType(prev) === 'object' ? prev : getItemChildrenProp(prev, tempObj);
    let newObj = getItemChildrenProp(cur, currentObj);
    // console.log(newObj, currentObj, 'current level obj');
    return newObj;
  });
  return value;
};

/**
 * @param stringOfObj 查找对象的路径 从子级开始， 以点区隔
 * @param obj 被查找的对象
 */
export const checkObjExist = (stringOfObj, obj) => {
  if (validateNull(stringOfObj)) return false;
  if (validateNull(obj)) return false;
  const array = stringOfObj.split('.');
  if (validateNull(array)) return false;
  let tempObj = obj;
  let value = array.reduce(function(prev, cur) {
    let currentObj = getObjType(prev) === 'object' ? prev : getItemChildrenProp(prev, tempObj);
    let newObj = getItemChildrenProp(cur, currentObj);
    return newObj;
  });
  return !!value;
};

const getItemChildrenProp = (str, obj) => {
  if (validateNull(str)) return null;
  if (validateNull(obj)) return null;
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
  if (validateNull(obj)) return null;
  let array = str.split('[');
  console.log('数组对象', array, obj);
  let index = parseInt(array[1]);
  let newObj = obj[array[0]];
  if (validateNull(newObj)) return null;
  return newObj[index];
};

const ACTION_TYPE = {
  DELETE: 'delete',
  UPDATE: 'update'
};

export function isJSON(str) {
  console.log(str, getObjType(str), '转换对象');
  if (getObjType(str) === 'string') {
    try {
      var obj = JSON.parse(str);
      console.log(getObjType(obj), '是否对象');
      if ((getObjType(obj) === 'object' || getObjType(obj) === 'array') && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('error：' + str + '!!!' + e);
      return false;
    }
  }
  console.log('It is not a string!');
}

export const makeBlockOutputJson = (page) => {
  let outputJson = util._initComponentsList(page, page);
  const base64 = zipLayout(outputJson);
  return base64;
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

const util = {
  findSlug,
  ACTION_TYPE,
  getObjType,
  validateNull,
  formatObject,
  getObjValue,
  isJSON,
  zipLayout,
  unzipLayout,
  makeBlockOutputJson,
  mySpanMethod
};

export default util;
