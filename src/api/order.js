import axios from './request';
let baseUrl = '/apis';
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
    url: `${baseUrl}/ElsOrgCategoryService/${action}`,
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
