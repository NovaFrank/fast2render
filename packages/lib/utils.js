import { validateNull } from "./validate";
import _ from "lodash";
import { setStore, getStore } from "./store";
import Formula from "@hapi/formula";

export const getApiPath = () => {
  let projectPath;
  if (top.location.pathname) {
    projectPath = top.location.pathname.split("/")[1];
  }

  if (projectPath) {
    return "/" + projectPath + "/apis";
  } else {
    return "/apis";
  }
};

/**
 * 验证表单
 *
 * @param {表单实例} form
 */
export const vaildForm = form => {
  let flag;
  form.validate(valid => {
    flag = valid;
  });
  return flag;
};

/**
 * 序列化请求数据
 */
export const serialize = data => {
  const list = [];
  Object.keys(data).forEach(ele => {
    list.push(`${ele}=${data[ele]}`);
  });
  return list.join("&");
};

/**
 *获取对象类型
 */
export const getObjType = obj => {
  var toString = Object.prototype.toString;
  var map = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regExp",
    "[object Undefined]": "undefined",
    "[object Null]": "null",
    "[object Object]": "object"
  };

  if (obj instanceof Element) {
    return "element";
  }

  return map[toString.call(obj)];
};

export const getRowPromession = data => {
  let newData = {};
  if (getObjType(data) === "array") {
    data.map(item => {
      // 进行真假字符串识别转换
      if (item.display === "true") {
        item.display = true;
      } else if (item.display === "false") {
        item.display = false;
      }
      newData[item.prop] = item;
    });
  } else if (getObjType(data) === "object") {
    newData = data;
  }
  // console.log('End Peromession data', newData);
  return newData;
};

const checkShowEdit = (item, role) => {
  let isShow = true;
  let isEdit = true;
  const isSales = !!(role && role === "sales");
  if (isSales) {
    isShow = !!item.saleShow;
    isEdit = !!item.saleEdit;
  } else {
    isShow = !!item.purchaseShow;
    isEdit = !!item.purchaseEdit;
  }
  return { isShow, isEdit };
};
export const handlerLocalRolePermission = (list, role) => {
  if (!list) {
    return [];
  }

  const newColumn = [];
  const baseUrl = getApiPath();
  list.map(item => {
    const rule = checkShowEdit(item, role);
    if (rule.isShow) {
      let label = item.label;
      if (item.displayName) {
        item.label = item.displayName;
        label = item.displayName;
      }
      const isRequired = !!item.isRequired;
      if (isRequired) {
        const rule = {
          required: true,
          message: "请输入" + label,
          trigger: "blur"
        };
        if (item.rules) {
          item.rules.push(rule);
        } else {
          item.rules = [rule];
        }
      }
      if (!validateNull(item.bizDic)) {
        delete item.dicData;
        delete item.dicMethod;
        delete item.props;
        item.type = "select";
        item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
      }
      if (item.isDisabled || item.readonly || rule.isEdit) {
        item.disabled = "disabled";
        item.cell = false;
        item.rules = [];
      } else {
        item.cell = true;
      }
      item.display = true;
      newColumn.push(item);
    }
  });
  return clearColumn(newColumn);
};

export const handlerLocalPermission = list => {
  if (!list) {
    return [];
  }
  const newColumn = [];
  const baseUrl = getApiPath();
  list.map(item => {
    if (item.display && (item.display === "true" || item.display === true)) {
      let label = item.label;
      if (item.displayName) {
        item.label = item.displayName;
        label = item.displayName;
      }
      const isRequired = !!item.isRequired;
      if (isRequired) {
        const rule = {
          required: true,
          message: "请输入" + label,
          trigger: "blur"
        };
        if (item.rules) {
          item.rules.push(rule);
        } else {
          item.rules = [rule];
        }
      }
      if (!validateNull(item.bizDic)) {
        delete item.dicData;
        delete item.dicMethod;
        delete item.props;
        item.type = "select";
        item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
      }
      if (item.isDisabled || item.readonly) {
        item.disabled = "disabled";
        item.cell = false;
        item.rules = [];
      } else {
        item.cell = true;
      }
      item.display = true;
      newColumn.push(item);
    }
  });
  return clearColumn(newColumn);
};

/**
 *
 * @param {*} data  要处理的数据
 * @param {*} expect 默认数据，数据类型不一致将返回默认数据
 */
export const formatObject = (data, expect) => {
  const type = getObjType(data);
  const expectType = getObjType(expect);
  if (type === "null" || type === "undefined") {
    return expect;
  }
  if (type === expectType) {
    return data;
  }
  if (type === "string") {
    let newData;
    try {
      newData = unzipLayout(data);
    } catch (err) {
      console.log("非base64");
      newData = null;
    }
    const newType = getObjType(newData);
    if (newType === expectType) {
      return newData;
    }
  }
  return expect;
};

export const deepClone = data => {
  var type = getObjType(data);
  var obj;

  if (type === "array") {
    obj = [];
  } else if (type === "object") {
    obj = {};
  } else {
    // 不再具有下一层次
    return data;
  }
  if (type === "array") {
    for (var i = 0, len = data.length; i < len; i++) {
      obj.push(deepClone(data[i]));
    }
  } else if (type === "object") {
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
  let result = "";
  if (validateNull(dic)) {
    return value;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
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
    value.forEach(ele => {
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
  const array = url.split("/");
  return array[index];
};

export const uniqBy = (arr, prop) => {
  const newArr = _.uniqBy(arr, prop);
  return newArr;
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
  const array = stringOfObj.split(".");
  if (validateNull(array)) {
    return null;
  }
  const tempObj = obj;
  const value = array.reduce(function(prev, cur) {
    const currentObj =
      getObjType(prev) === "object" ? prev : getItemChildrenProp(prev, tempObj);
    const newObj = getItemChildrenProp(cur, currentObj);
    // console.log(newObj, currentObj, 'current level obj');
    return newObj;
  });
  return value;
};

export const detailDataType = (value, type) => {
  if (type === "number") {
    return Number(value);
  } else if (type === "string") {
    return value + "";
  } else {
    return value;
  }
};

/**
 *
 * @param {*} Formulas 要执行的公式， 可多个
 * @param {*} obj 要被计算的对象
 */
export const doCalc = (Formulas, obj) => {
  if (getObjType(Formulas) === "string") {
    const Formula = getFormulaItem(Formulas);
    const newObj = getFormulaValue(Formula, obj);
    return newObj;
  } else if (getObjType(Formulas) === "array") {
    let newObj = obj;
    Formulas.map(async item => {
      newObj = doCalc(item, newObj);
    });
    return newObj;
  }
};

/**
 *
 * @param {*} Formulas 要执行的公式， 可为数组 [‘formula1’, ‘formula2’] 或者为 字符串 ‘formula1’
 * @param {*} list 要被计算的列表
 */
export const doListCalc = (Formulas, list) => {
  if (getObjType(list) === "array") {
    const newList = list.map(item => {
      const res = doCalc(Formulas, item);
      return res;
    });
    return newList;
  }
  return list;
};

/**
 * 根据字段数组排序
 */

export const vaildData = (val, dafult) => {
  if (typeof val === "boolean") {
    return val;
  }
  return !validateNull(val) ? val : dafult;
};

/**
 *
 * @param {*} formulaItem   计算公式
 * @param {*} obj   要处理的数据对象
 */
export const getFormulaValue = (formulaItem, obj = {}) => {
  const reference = function(name) {
    return context => getNum(context[name]);
  };
  const checkNum = n => {
    if (getObjType(n) === "number" && n > 0) {
      return true;
    }
    return false;
  };
  const getNum = function(value) {
    let n = 0;
    // 如果是字符串转数字
    if (getObjType(value) === "string") {
      n = parseFloat(value);
    }
    // 结果为数字 直接返回数字 否则 返回 0
    if (checkNum(n)) {
      return n;
    }
    return 0;
  };
  const functions = {
    r: value => value.toFixed(2)
  };
  if (!formulaItem || !formulaItem.formulaElementJson || !formulaItem.content) {
    obj.formulaVauleResult = false;
    return obj;
  }
  const fullContent = formulaItem.content || "";
  const content = fullContent.split("=")[0];
  const result = fullContent.split("=")[1] || "r";
  const type = getObjType(formulaItem.formulaElementJson);

  const list =
    type === "array"
      ? formulaItem.formulaElementJson
      : JSON.parse(formulaItem.formulaElementJson);
  const calcObj = {};
  let resultField = "price";
  list.map(item => {
    calcObj[item.elementId] = obj[item.fieldName];
    if (item.elementId === result) {
      resultField = item.fieldName;
    }
  });

  const formula = new Formula.Parser(content, {
    reference,
    functions
  });
  const real = formula.evaluate(calcObj);
  if (checkNum(real)) {
    obj[resultField] = real.toFixed(2);
    obj.formulaVauleResult = true;
  } else {
    obj.formulaVauleResult = false;
    obj.formulaVauleMessage = "数值异常,请检查输入";
  }
  console.log(real, "最终计算结果");
  return obj;
};

export const clearColumn = subList => {
  function isValid(option = {}, ele = "") {
    const result = option[ele] + "" || "";
    return !result || result === "null" || result === "" || ele.includes("$");
  }
  const _subList = subList.map(subitem => {
    Object.keys(subitem).forEach(ele => {
      const isNotWell = isValid(subitem, ele);
      // 删除无效参数
      if (isNotWell) {
        delete subitem[ele];
      }
      // 补充字典
    });
    return subitem;
  });
  return _subList;
};

/**
 *
 * @param {*} list 用来排序的数组
 * @param {*} prop 排序对比属性
 */
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
 * @param stringOfObj 查找对象的路径 从子级开始， 以点区隔  this.arr[0].item
 * @param obj 被查找的对象
 */
export const checkObjExist = (stringOfObj, obj) => {
  if (validateNull(stringOfObj)) {
    return false;
  }
  if (validateNull(obj)) {
    return false;
  }
  const array = stringOfObj.split(".");
  if (validateNull(array)) {
    return false;
  }
  const tempObj = obj;
  const value = array.reduce(function(prev, cur) {
    const currentObj =
      getObjType(prev) === "object" ? prev : getItemChildrenProp(prev, tempObj);
    const newObj = getItemChildrenProp(cur, currentObj);
    return newObj;
  });
  return !!value;
};

/**
 *
 * @param {*} str 获取子级数据
 * @param {*} obj 要获取的对象
 */
const getItemChildrenProp = (str, obj) => {
  if (validateNull(str)) {
    return null;
  }
  if (validateNull(obj)) {
    return null;
  }
  try {
    return str.includes("[") ? getItemFormArrayStr(str, obj) : obj[str];
  } catch (err) {
    console.log("error：" + str + "!!!" + err);
    return null;
  }
};

/**
 *
 * @param {*} jsonObj 把对象转换为 base64
 */
export const zipLayout = jsonObj => {
  return btoa(unescape(encodeURIComponent(JSON.stringify(jsonObj))));
};

/**
 *
 * @param {*} jsonObjStr  把 base64 转换为对象
 */
export const unzipLayout = jsonObjStr => {
  let _atob = "";
  try {
    _atob = decodeURIComponent(escape(atob(jsonObjStr)));
  } catch (e) {
    _atob = jsonObjStr;
  }
  const projectObj = isJSON(_atob);
  console.log(projectObj, "解压缩数据");
  return projectObj;
};

/**
 *
 * @param {*} str  带数组定义字符串  list[0]
 * @param {*} obj  要取值的对象
 */
export const getItemFormArrayStr = (str, obj) => {
  if (validateNull(obj)) {
    return null;
  }
  const array = str.split("[");
  const index = parseInt(array[1]);
  const newObj = obj[array[0]];
  if (validateNull(newObj)) {
    return null;
  }
  return newObj[index];
};

/**
 *
 * @param {*} str  判断是否json 数据
 */
export function isJSON(str) {
  if (getObjType(str) !== "string") {
    return false;
  }
  try {
    var obj = JSON.parse(str);
    return (getObjType(obj) === "object" || getObjType(obj) === "array") && obj;
  } catch (e) {
    console.log("error：" + str + "!!!" + e);
    return false;
  }
}

export const getParseJson = str => {
  const isJson = isJSON(str);
  if (isJson) {
    return JSON.parse(str);
  }
  return null;
};

/**
 *
 * @param {*} action  获取字典条目
 */
export const getDicItem = async (action, dic = "commondic") => {
  let item = getItemFormMap(action, dic);
  if (!item) {
    await loadDic();
    item = getItemFormMap(action, dic);
  }
  return item;
};

export const getDicNow = (action, dic = "commondic") => {
  const item = getItemFormMap(action, dic);
  if (!item) {
    loadDic();
  }
  return item;
};

/**
 *
 * @param {*} action  获取字典条目
 */
export const getDicList = async (action, dic = "commondic") => {
  const list = getListFormMap(action, dic);
  return list;
};

/**
 *
 * @param {*} action 公式名称
 * TODO 如果未找到 尝试刷新公式列表
 */
export const getFormulaItem = (action, dic = "commonFormula") => {
  let item = getItemFormMap(action, dic);
  if (!item) {
    loadFormula();
    item = getItemFormMap(action, dic);
  }
  return item;
};

/**
 * 初始化所有公式
 */
export const getFormulaList = async () => {
  let lib = getStore({ name: "commonFormula" });
  if (lib && getObjType(lib) !== "object") {
    lib = JSON.parse(lib);
  } else {
    loadFormula();
  }
  const list = [];
  Object.keys(lib).map(item => {
    const newItem = {
      name: lib[item].name,
      value: item
    };
    list.push(newItem);
  });
  return list;
};

/**
 *
 * @param {*} action  获取数据库导出字段用来进行字段配置
 */
export const getTableItem = async action => {
  let item = getItemFormMap(action, "allTableColumn");
  if (!item) {
    await loadAllTable();
    item = getItemFormMap(action, "allTableColumn");
  }
  return item;
};

const getItemFormMap = (action, storeName) => {
  const lib = getStore({ name: storeName });
  if (lib) {
    const item = lib[action];
    if (item) {
      return item;
    }
  }
  return null;
};

const getListFormMap = (action, storeName) => {
  const lib = getStore({ name: storeName });
  const list = [];
  if (lib) {
    Object.keys(lib).map(item => {
      list.push({
        label: lib[item].name,
        value: item
      });
    });
    return list;
  }
  return null;
};
/**
 * 获取所有数据库字段
 */
export const getTableList = () => {
  let lib = parseTableList();
  let list = [];
  if (!validateNull(lib)) {
    lib = loadAllTable();
    list = parseTableList();
  }
  return list;
};

const parseTableList = () => {
  const lib = getStore({ name: "allTableColumn", timer: 240 });
  const list = [];
  if (lib) {
    Object.keys(lib).map(item => {
      const newItem = {
        name: item,
        value: item
      };
      list.push(newItem);
    });
    return list;
  }
};
/**
 *
 * @param {*} type 获取指定模版定义
 */
export const getTemplateItem = async type => {
  let item = getParseJson(getStore({ name: type, timer: 300 }));
  if (item) {
    return item;
  } else {
    item = await loadTemplate(type);
    console.log(item);
    return item;
  }
};

/**
 *
 * @param {*} type 获取指定组件定义
 */
export const getBlockItem = async type => {
  let item = getStore({ name: type, timer: 300 });
  if (item) {
    return item;
  } else {
    item = await loadBlock(type);
    return item;
  }
};

export const getBlockFieldItem = async type => {
  const fieldType = "field_" + type;
  let item = getStore({ name: fieldType });
  if (item && getObjType(item) !== "object" && getObjType(item) !== "array") {
    item = JSON.parse(item);
  }
  if (item) {
    return item;
  } else {
    item = await loadBlock(fieldType);
    return item;
  }
};

/**
 * 加载公式
 */

export const loadFormula = async () => {
  const filePath = "https://config-static.oss-cn-hangzhou.aliyuncs.com/common/";
  const url = `${filePath}formula/index.json`;
  const item = await loadJson(url, "commonFormula");
  return item;
};

/**
 * 加载词典
 */
export const loadDic = async () => {
  const filePath = "https://config-static.oss-cn-hangzhou.aliyuncs.com/common/";
  const url = `${filePath}dic/index.json`;
  const item = await loadJson(url, "commondic");
  return item;
};

/**
 * 加载字段
 */
export const loadAllTable = async () => {
  const filePath = "https://config-static.oss-cn-hangzhou.aliyuncs.com/common/";
  const url = `${filePath}allTableColumn.json`;
  const item = await loadJson(url, "allTableColumn");
  return item;
};

/**
 *
 * @param {*} type  加载指定模版
 */
export const loadTemplate = async type => {
  const filePath =
    "https://config-static.oss-cn-hangzhou.aliyuncs.com/common/template/";
  const url = `${filePath}${type}.json`;
  const item = await loadJson(url, type);
  return item;
};

/**
 *
 * @param {*} type  加载组件
 */

export const loadBlock = async type => {
  const filePath =
    "https://config-static.oss-cn-hangzhou.aliyuncs.com/common/block/";
  const url = `${filePath}${type}.json`;
  const block = await loadJson(url, type);
  return block;
};

export const initJson = () => {
  loadAllTable();
  loadDic();
  loadFormula();
};

export const loadJson = (url, name) => {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      if (xhr.status === 200) {
        console.log("获取文件", url);
        setStore({ name, content: xhr.response });
        resolve(xhr.response);
      } else {
        console.log("获取文件失败", xhr.status, xhr.statusText);
        this.$message.error("获取文件失败", xhr.statusText);
        reject(new Error("服务器错误，获取文件失败"));
      }
    };
    xhr.send();
  });
};

export const makeBlockOutputJson = page => {
  const outputJson = util._initComponentsList(page, page);
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
  localColum.map(item => {
    newColumn = newColumn.map(subitem => {
      let newSubItem = subitem;
      if (subitem.prop === item.prop) {
        newSubItem = _.merge(subitem, item);
      }
      return newSubItem;
    });
    const isExist = newColumn.find(subitem => {
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

  const itemArr = []; // 需要合并的数组。
  data.forEach(item => {
    if (item[filed] === row[filed]) {
      itemArr.push(item);
    }
  });
  for (let i = 0; i < arr.length; i++) {
    if (columnIndex === arr[i]) {
      // itemArr第一项需要向下合并，其它的不需要。
      const rowFiled = row[filed];
      const itemFiled = itemArr[0][filed];
      const rid = row[id];
      const itemId = itemArr[0][id];
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
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds()
  };
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = o[k] + "";
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str)
      );
    }
  }
  return fmt;
};
function padLeftZero(str) {
  return ("00" + str).substr(str.length);
}

/// 格式化文件大小的JS方法
/// <param name="filesize">文件的大小,传入的是一个bytes为单位的参数</param>
/// <returns>格式化后的值</returns>
export const renderSize = filesize => {
  if (filesize === null || filesize === "") {
    return "0 Bytes";
  }
  const unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let index = 0;
  const srcsize = parseFloat(filesize);
  index = Math.floor(Math.log(srcsize) / Math.log(1024));
  let size = srcsize / Math.pow(1024, index);
  size = size.toFixed(2); // 保留的小数位数
  return size + unitArr[index];
};

export const getAccount = () => {
  const userInfo = getStore({ name: "userInfo", timer: 1200 }); // getStore 使用样例
  if (userInfo && userInfo.elsAccount) {
    return userInfo;
  }
  return {
    elsAccount: "",
    elsSubAccount: "",
    token: ""
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
  renderSize,
  getTemplateItem,
  getDicItem,
  getFormulaItem,
  getBlockItem,
  doCalc,
  doListCalc,
  uniqBy,
  initJson,
  getDicList
};

export default util;
