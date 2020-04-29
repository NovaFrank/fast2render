import request from '@/router/axios';
let prefix = '/apis';

// TODO: 临时，需要删除
// 列表 queryElsFromSta、更新 saveElsFromSta、新增 insertElsFromSta、删除 delElsFromSta
export const elsFromSta = (action, param) =>
  request({
    url: `${prefix}/ElsFromStaService/${action}`,
    method: 'post',
    data: { ...param }
  });

// TODO: 临时，需要删除
// 列表 queryElsFromColumnSta、保存（新增、更新、删除） delElsFromColumnSta
export const elsFromColumnSta = (action, param) =>
  request({
    url: `${prefix}/ElsFromColumnStaService/${action}`,
    method: 'post',
    data: { ...param }
  });

// 询报价信息列表的查询 findPageList post
// 保存询价单 save post
// 发布 publishEnquiry post
// 接受/拒绝 acceptOrRefuse post
// 关闭 close post
export const purchaseEnquiryAction = (action, params) =>
  request({
    url: `${prefix}/inquiry/PurchaseEnquiryService/${action}`,
    method: 'post',
    data: { ...params }
  });

// 询价单头明细查询 findHeadDetails/${enquiryNumber} get
// 询价单行明细查询 findItemDetails/${enquiryNumber} get
// 询价单删除 delete/${enquiryNumber} get
export const queryDetailAction = (action, enquiryNumber) =>
  request({
    url: `${prefix}/inquiry/PurchaseEnquiryService/${action}/${enquiryNumber}`,
    method: 'get'
  });
