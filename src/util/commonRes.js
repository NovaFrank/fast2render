import { getStore, setStore } from '@/util/store.js';
import { getUserInfo } from '@/util/utils';
import commonApi from '@/api/index.js';

export const getCommonRes = async (action, params = {}) => {
  let account = getUserInfo();
  if (!account) return [];
  let key = `${account.elsAccount}_${account.elsSubAccount}_${action}`;
  let data = getStore({ name: key, timer: 120 });
  if (!data || !data.length) {
    data = await getRemoteRes(action, (params = {}));
    setStore({ name: key, content: data });
  }
  return data;
};

export const getRemoteRes = async (action, params = {}) => {
  let data = [];
  if (commonApi[action]) {
    let res = await commonApi[action](params);
    if (res.data && res.data.pageData && res.data.pageData.rows && res.data.pageData.rows.length) {
      data = res.data.pageData.rows;
    }
  }
  return data;
};