import axios from '@/router/axios';
import { getUserInfo } from '@/util/auth';
const baseUrl = '/apis';
const layout = '/layout';
const userInfo = getUserInfo();
const elsAccount = userInfo.elsAccount;
const elsSubAccount = userInfo.elsSubAccount;

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
    url: `${baseUrl}/QuaTemplateHeadService/${action}`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};

// 样品模板
export const sampleTemplateServer = (action, params) => {
  return axios({
    url: `${baseUrl}/sample/sampleTemplateService/${action}`,
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

const commonApi = {
  supplierServer,
  subAccountServer,
  orgServer,
  cateServer,
  uploadFile,
  attachmentServer,
  download
};
export default commonApi;
