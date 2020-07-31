import request from '@/api/axios';
import { getAccount, getApiPath } from '@/util/utils.js';

const prefix = getApiPath();
const userInfo = getAccount();
const elsAccount = userInfo.elsAccount;

export const historyAction = (action, params) =>
  request({
    url: `${prefix}/order/PurchaseOrderService/${action}`,
    method: 'post',
    data: { ...params, elsAccount }
  });
