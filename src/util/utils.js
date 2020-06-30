import _ from 'lodash';
import { getStore, setStore } from '@/util/store.js';
import { login } from '@/api/index';
import { setToken } from '@/util/auth.js';
import md5 from 'js-md5';

// 对象数组排序
export const compare = function(prop) {
  return function(obj1, obj2) {
    const val1 = obj1[prop];
    const val2 = obj2[prop];
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
  };
};

/**
 * 验证表单
 *
 * @param {表单实例} form
 */
export const validForm = (form) => {
  let flag;

  form.validate((valid) => {
    flag = valid;
  });

  return flag;
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
export const mySpanMethod = (data, arr, filed, id, columnIndex, row) => {
  // 通过groupBy将数据处理成，需要合并的排在一起。
  let myData = Object.values(_.groupBy(data, filed)).flat();
  let itemArr = []; // 需要合并的数组。
  myData.forEach((item) => {
    if (item[filed] === row[filed]) {
      itemArr.push(item);
    }
  });
  for (let i = 0; i < arr.length; i++) {
    if (columnIndex === arr[i]) {
      // itemArr第一项需要向下合并，其它的不需要。
      if (row[filed] === itemArr[0][filed] && row[id] === itemArr[0][id]) {
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
};

export const getUserInfo = () => {
  if (window.frames.length === parent.frames.length) {
    getLocalToken();
  }
  return getStore({ name: 'userInfo', timer: 1200 }); // getStore 使用样例
};

export const getSupplierInfo = () => {
  if (window.frames.length === parent.frames.length) {
    getLocalToken(true);
  }
  return getStore({ name: 'userInfo', timer: 1200 }); // getStore 使用样例
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

export const getLocalToken = (supplier) => {
  const params = {
    elsAccount: supplier ? '是307201' : '307000',
    elsSubAccount: '1001',
    elsSubAccountPassword: md5('123')
  };
  login(params).then((res) => {
    setToken(res.data.data.token);
    let params2 = {
      name: 'userInfo',
      content: {
        elsAccount: params.elsAccount,
        elsSubAccount: params.elsSubAccount,
        token: res.data.data.token
      }
    };
    setStore(params2);
  });
};

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
