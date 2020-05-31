import axios from './request';
import { getUserInfo } from '@/util/utils';
const baseUrl = '/apis';
const layout = '/layout';
const userInfo = getUserInfo();
const elsAccount = userInfo ? userInfo.elsAccount : '307000';
const elsSubAccount = userInfo ? userInfo.elsSubAccount : '1001';

export const dicLayoutServer = (action) => {
  return axios({
    url: `${layout}/dics/value/${action}`,
    method: 'get'
  });
};

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

// 邀请码
export const invitationCodeActions = (action, params) => {
  return axios({
    url: `${baseUrl}/supplier/SupplierRegisterCodeService/${action}`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};

// 资质准入模板
export const qualTemplateServer = (action, params) => {
  return axios({
    url: `${baseUrl}/supplier/QuaTemplateHeadService/${action}`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};

// 验厂模板
export const factoryTemplateServer = (action, params) => {
  return axios({
    url: `${baseUrl}/supplier/SupplierFacInsTemplateHeadService/${action}`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};

// 全部物料查询
export const materialServer = (params) => {
  params.pageSize = 20000;
  return axios({
    url: `${baseUrl}/MaterialService/findPageList`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      // elsSubAccount: elsSubAccount,
      ...params
    }
  });
};

// 样品模板
export const sampleTemplateServer = (action, params) => {
  return axios({
    url: `${baseUrl}/supplier/sampleTemplateService/${action}`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
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

export const attachmentServer = (action, params, method) => {
  return axios({
    url: `${baseUrl}/ElsAttachmentService/${action}`,
    method: method,
    data: {
      elsAccount,
      elsSubAccount,
      businessElsAccount: elsAccount,
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
  auditServer,
  materialServer
};
export default commonApi;
