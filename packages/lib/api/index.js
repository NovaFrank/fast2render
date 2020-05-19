import axios from '../axios';
import { getUserInfo } from '../auth';
const baseUrl = '/apis';
const userInfo = getUserInfo();
const elsAccount = userInfo.elsAccount;
const elsSubAccount = userInfo.elsSubAccount;

// 全量组织架构查询
export const dicServer = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsSearchDictionaryService/${action}`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      elsSubAccount: elsSubAccount,
      ...params
    }
  });
};

// 全量组织架构查询
export const orgServer = (params) => {
  params.pageSize = 20000;
  return axios({
    url: `${baseUrl}/ElsOrgInfoService/findPageList`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};

// 全部用户子账号查询
export const subAccountServer = (params) => {
  params.pageSize = 20000;
  return axios({
    url: `${baseUrl}/ElsAccountService/findPageList`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};

// 全部用户子账号查询
export const staffs = (params) => {
  params.pageSize = 20000;
  return axios({
    url: `${baseUrl}/ElsAccountService/findPageList`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};
// 全部供应商账号查询
export const supplierServer = (params) => {
  params.pageSize = 20000;
  return axios({
    url: `${baseUrl}/supplier/SupplierMasterDataService/findPageList`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};
export const cateServer = (params) => {
  params.pageSize = 20000;
  return axios({
    url: `${baseUrl}/MaterialCateService/findPageList/${elsAccount}`,
    method: 'get'
  });
};

export const uploadFile = (params) => {
  return axios({
    url: `${baseUrl}/FileService/uploadFile`,
    method: 'post',
    data: {
      elsAccount,
      elsSubAccount,
      ...params
    }
  });
};

export const download = (params) => {
  return axios({
    url: `${baseUrl}/FileService/downloadFile`,
    method: 'post',
    data: {
      elsAccount,
      elsSubAccount,
      ...params
    }
  });
};

// 上传
export const attachmentServer = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsAttachmentService/${action}`,
    method: 'post',
    data: {
      elsAccount,
      elsSubAccount,
      ...params
    }
  });
};

// 提交审批
export const auditServer = (action, params, method) => {
  return axios({
    url: `${baseUrl}/CommonAuditService/${action}`,
    method: method,
    data: {
      elsAccount,
      elsSubAccount,
      ...params
    }
  });
};

const commonApi = {
  supplierServer,
  subAccountServer,
  orgServer,
  cateServer,
  uploadFile,
  attachmentServer,
  download,
  staffs,
  auditServer
};
export default commonApi;
