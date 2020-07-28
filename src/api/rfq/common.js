import request from '@/router/axios';
import { getApiPath } from '@/util/utils.js';

let prefix = getApiPath();

export const uploadServlet = (formdata) => {
  return request({
    url: `${prefix}/servlet/UploadServlet`,
    method: 'post',
    data: formdata
  });
};
export const importExcel = (url) => {
  return request({
    url: `${prefix}/inquiry/PurchaseEnquiryService/importExcel`,
    method: 'post',
    data: {
      queryStr: url
    }
  });
};

// 配置平台数据字典查询
export const dataDicAPI = (code) =>
  request({
    url: `/layout/dics/value/${code}`,
    method: 'get'
  });

// 数据字典查询-/ElsSearchDictionaryService/findPageList
export const dataDicAction = (param) =>
  request({
    url: `${prefix}/ElsSearchDictionaryService/findPageList`,
    method: 'post',
    data: { ...param }
  });
// 物料查询-/MaterialService/findPageList
export const materialListAction = (param) =>
  request({
    url: `${prefix}/MaterialService/findPageList`,
    method: 'post',
    data: { ...param }
  });
// 供应商查询-/supplier/SupplierMasterDataService/findPageList
export const supplierMasterListAction = (param) =>
  request({
    url: `${prefix}/supplier/SupplierMasterDataService/findPageList`,
    method: 'post',
    data: { ...param }
  });
// 系统账号查询（作为负责人）-POST /ElsAccountService/findPageList
export const accountListAction = (param) =>
  request({
    url: `${prefix}/ElsAccountService/findPageList`,
    method: 'post',
    data: { ...param }
  });

// 组织（公司）列表 POST /ElsOrgInfoService/findPageList
export const orgList = (param) =>
  request({
    url: `${prefix}/ElsOrgInfoService/findPageList`,
    method: 'post',
    data: { pageSize: 100, ...param }
  });

// 4大类
export const cateService = (params) => {
  params.pageSize = 20000;
  return request({
    url: `${prefix}/MaterialCateService/findListByLevel`,
    method: 'post',
    data: params
  });
};
