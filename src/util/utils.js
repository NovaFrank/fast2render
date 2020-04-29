/**
 * 验证表单
 *
 * @param {表单实例} form
 */
import { getStore, setStore } from '@/util/store.js';
import { login } from '@/api/order';
import { setToken } from '@/util/auth.js';
import md5 from 'js-md5';

export const validForm = (form) => {
  let flag;

  form.validate((valid) => {
    flag = valid;
  });

  return flag;
};

export const getUserInfo = () => {
  if (window.frames.length === parent.frames.length) {
    getLocalToken();
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

export const getLocalToken = () => {
  const params = {
    elsAccount: '307000',
    elsSubAccount: '1001',
    elsSubAccountPassword: md5('123')
  };
  login(params).then((res) => {
    console.log(res.data.data.token);
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
