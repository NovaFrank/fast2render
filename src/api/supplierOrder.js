import axios from './request';
// import { getUserInfo } from '@/util/utils.js';
let baseUrl = '/apis';
// const userInfo = getUserInfo();
// const elsAccount = userInfo.elsAccount;
// const elsSubAccount = userInfo.elsSubAccount;
// 获取登录信息
export const login = (params) => {
  return axios({
    url: `${baseUrl}/ElsAuthService/login`,
    method: 'post',
    data: {
      ...params
    }
  });
};
// 获取物料列表
export const getCrudData = (action, params) => {
  return axios({
    url: `${baseUrl}/MaterialService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 获取供应商列表
export const getSupplierData = (action, params) => {
  return axios({
    url: `${baseUrl}/supplier/SupplierMasterDataService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 获取订单列表
export const getOrderList = (action, params) => {
  return axios({
    url: `${baseUrl}/order/SaleOrderService/${action}`,
    method: 'post',
    data: {
      // elsAccount: elsAccount,
      ...params
    }
  });
};

// 新增订单-修改订单
export const createOrder = (action, params) => {
  return axios({
    url: `${baseUrl}/order//PurchaseOrderService/${action}`,
    method: 'post',
    data: {
      // elsAccount: elsAccount,
      ...params
    }
  });
};

// 获取配置数据字典
export const getDataDic = (code) => {
  return axios({
    url: `/layout/dics/value/${code}`,
    method: 'get'
  });
};

// 获取采购负责人信息
export const getPurchasePerson = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsAccountService/${action}`,
    method: 'post',
    data: {
      // elsAccount: elsAccount,
      ...params
    }
  });
};
