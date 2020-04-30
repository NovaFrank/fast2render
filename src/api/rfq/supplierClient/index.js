import request from '@/router/axios';
let prefix = '/apis';

// post
// 列表 findPageList
// 保存 save
// 报价/发送 quote
export const postAction = (action, param) =>
  request({
    url: `${prefix}/inquiry/SaleEnquiryService/${action}`,
    method: 'post',
    data: { ...param }
  });

// get
// 信息头 findHeadDetails
// 行信息 findItemDetails
export const getAction = (action, enquiryNumber) =>
  request({
    url: `${prefix}/inquiry/SaleEnquiryService/${action}/${enquiryNumber}`,
    method: 'get'
  });
