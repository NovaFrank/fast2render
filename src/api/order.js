import axios from './request';
import { getApiPath } from '@/util/utils';

const apiRootURL = getApiPath();
const baseUrl = apiRootURL;

const orderApiUrl = `${apiRootURL}/order`;
const baseServerName = 'PurchaseOrderService';

/**
 * list purchase order
 * @param {*} params
 * @returns
 */
export const list = (params, serverName = baseServerName) => {
  return axios({
    url: `${orderApiUrl}/${serverName}/findPageList`,
    method: 'post',
    data: params
  });
};

// 配置平台数据字典查询
export const dataDicAPI = (code) => {
  return axios({
    url: `/layout/dics/value/${code}`,
    method: 'get'
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
// 获取价格主数据列表
export const getPriceData = (action, params) => {
  return axios({
    url: `${baseUrl}/inquiry/PurchasePriceRecordsService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};
// 获取审批记录
export const getAudit = (action, params) => {
  return axios({
    url: `${baseUrl}/CommonAuditService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};
// 获取价格主数据 -- 获取详情
export const getPriceDetail = (action, params) => {
  return axios({
    url: `${baseUrl}/inquiry/PurchasePriceRecordsService/${action}`,
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
    url: `${baseUrl}/order/PurchaseOrderService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 新增订单-修改订单
export const createOrder = (action, params) => {
  return axios({
    url: `${baseUrl}/order/PurchaseOrderService/${action}`,
    method: 'post',
    data: {
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
      ...params
    }
  });
};
// 获取采购组列表
export const getPurchaseGroup = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsOrgInfoService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 提交审批
export const submitAudit = (action, params) => {
  return axios({
    url: `${baseUrl}/CommonAuditService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 上传附件
export const uploadServlet = (formdata) => {
  return axios({
    url: `${baseUrl}/servlet/UploadServlet`,
    method: 'post',
    data: formdata
  });
};
// 获取采购组/工厂列表
export const getFactoryGroup = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsOrgInfoService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

export const findOrderHeadVO = (params) => {
  return axios({
    url: `${orderApiUrl}/PurchaseOrderService/findOrderHeadVO`,
    method: 'post',
    data: {
      ...params
    }
  });
};

export const findOrderItemList = (params) => {
  return axios({
    url: `${orderApiUrl}/PurchaseOrderService/findOrderItemList`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 修改订单
export const updateOrder = (params) => {
  return axios({
    url: `${orderApiUrl}/PurchaseOrderService/updateOrder`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 新增订单
export const create = (params) => {
  return axios({
    url: `${baseUrl}/order/PurchaseOrderService/createOrder`,
    method: 'post',
    data: {
      ...params
    }
  });
};

export const PurchaseOrderService = {
  create,
  detailPrimaryTable: findOrderHeadVO,
  detailTable: findOrderItemList,
  list,
  update: updateOrder
};
