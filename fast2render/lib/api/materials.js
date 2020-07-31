import axios from '../axios';
import { getApiPath } from '../utils';
import { getUserInfo } from '../auth';

const baseUrl = getApiPath();
const userInfo = getUserInfo();
const elsAccount = userInfo.elsAccount;

/**
 * list materials
 * @param {*} params
 *  * @example
 * // { "elsAccount":"307000" }
 * @returns
 */
const listMaterial = (data) => {
  return axios({
    url: `${baseUrl}/MaterialService/findPageList`,
    method: 'post',
    data
  });
};

const listElsOrgInfo = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsOrgInfoService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 获取 工厂 列表
const listPurchaseFactory = (action, params) => {
  Object.assign(params, {
    orgCategoryId: 'factory'
  });

  return listElsOrgInfo(action, params);
};

// 获取 采购组 列表
const listPurchaseGroup = (action, params) => {
  Object.assign(params, {
    orgCategoryId: 'purchaseGroup'
  });

  return listElsOrgInfo(action, params);
};

// 获取 采购组织 列表
const listPurchaseOrganization = (action, params) => {
  Object.assign(params, {
    orgCategoryId: 'purchaseOrganization'
  });

  return listElsOrgInfo(action, params);
};

const getPurchaseOranization = (action, params) => {
  return axios({
    url: `${baseUrl}/ElsOrgCategoryService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 获取 供应商主数据 列表
const listSupplierList = (action, params) => {
  return axios({
    url: `${baseUrl}/supplier/SupplierMasterDataService/${action}`,
    method: 'post',
    data: {
      elsAccount: elsAccount,
      ...params
    }
  });
};

// 获取 配置数据 列表
const findElsTemplateConfig = (params) => {
  const url = `${baseUrl}/ElsTemplateConfigService/findPageList`;

  return axios({
    url: url,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 获取 页面数据 列表
const findElsPageConfig = (params) => {
  const url = `${baseUrl}/template/TemplateBusinessPageService/findDetail`;
  return axios({
    url: url,
    method: 'post',
    data: {
      ...params
    }
  });
};

const getPurchasePerson = (params) => {
  return axios({
    url: `${baseUrl}/ElsAccountService/findPageList`,
    method: 'post',
    data: {
      ...params
    }
  });
};
const findCreateDeliveryNote = (param) =>
  axios({
    url: `${baseUrl}/order/PurchaseDeliveryNoteService/findCreateDeliveryNote`,
    method: 'post',
    data: { ...param }
  });

export const PurchaseDeliveryNoteService = {
  list: findCreateDeliveryNote
};

export const ElsAccountService = {
  listEmployee: getPurchasePerson
};

export const ElsOrgInfoService = {
  // list: listElsOrgInfo,
  listPurchaseFactory,
  listPurchaseGroup,
  listPurchaseOrganization
};

export const ElsOrgCategoryService = {
  getPurchaseOranization
};

export const ElsTemplateConfigService = {
  list: findElsTemplateConfig
};

export const ElsPageConfigService = {
  list: findElsPageConfig
};

export const MaterialService = {
  list: listMaterial
};

export const SupplierMasterDataService = {
  list: listSupplierList
};
