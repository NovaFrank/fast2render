import request from '@/router/axios';
let prefix = '/apis';

// 询报价信息列表的查询 findPageList post
// 保存询价单 save post
// 发布 publishEnquiry post
// 接受/拒绝 acceptOrRefuse post
// 关闭 close post
// 更新截止时间 updateQuoteEndTime post
// 重报价 againQuote post
// 发布新供应商 newSupplierPublish post
// 比价页面保存配额 POST /PurchaseEnquiryService/acceptOrRefuse
export const purchaseEnquiryAction = (action, params) =>
  request({
    url: `${prefix}/inquiry/PurchaseEnquiryService/${action}`,
    method: 'post',
    data: { ...params }
  });

// 询价单头明细查询 findHeadDetails/${enquiryNumber} get
// 询价单行明细查询 findItemDetails/${enquiryNumber} get
// 询价单删除 delete/${enquiryNumber} get
// 退回 goBack get
// 报价记录 queryQuote get
// 查询更新截止时间记录 queryUpdateQuoteEndTime get
export const queryDetailAction = (action, enquiryNumber) =>
  request({
    url: `${prefix}/inquiry/PurchaseEnquiryService/${action}/${enquiryNumber}`,
    method: 'get'
  });

// 比价 报价历史 POST /PurchaseOrderService/findOrderItemList
// {elsAccount:'采购ELS账号',orderNumber:'采购订单号'} materialNumber?
export const materialOrderHistory = (params) =>
  request({
    url: `${prefix}/inquiry/PurchaseOrderService/findOrderItemList`,
    method: 'post',
    data: { ...params }
  });

// 提交审批
export const submitAudit = (action, params) => {
  return request({
    url: `${prefix}/CommonAuditService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 撤回审批
export const cancelAudit = (action, params) => {
  return request({
    url: `${prefix}/CommonAuditService/${action}`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 成本模板 POST /ElsTemplateConfigService/findPageList
export const costTemplateList = (params) => {
  return request({
    url: `${prefix}/ElsTemplateConfigService/findPageList`,
    method: 'post',
    data: {
      ...params
    }
  });
};

// 风险监测
export const testSuppliers = (params) => {
  return request({
    url: `${prefix}/inquiry/PurchaseEnquiryService/findEnterpriseRelations`,
    method: 'post',
    data: params
  });
};

// 开启 POST /PurchaseEnquiryService/openPassWord
export const openPassWord = (params) => {
  return request({
    url: `${prefix}/inquiry/PurchaseEnquiryService/openPassWord`,
    method: 'post',
    data: params
  });
};

// 审批历史 POST /CommonAuditService/auditHislist
export const auditHisList = (params) => {
  return request({
    url: `${prefix}/CommonAuditService/auditHislist`,
    method: 'post',
    data: params
  });
};
