import request from '@/router/axios';
import { getAccount, getApiPath } from '@/util/utils.js';

let prefix = getApiPath();
const userInfo = getAccount();
const elsAccount = userInfo.elsAccount;

export const historyAction = (action, params) =>
  request({
    url: `${prefix}/order/PurchaseOrderService/${action}`,
    method: 'post',
    data: { ...params, elsAccount }
  });
