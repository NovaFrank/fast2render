import request from '@/router/axios';
let prefix = '/apis';

// 列表 queryElsFromSta、更新 saveElsFromSta、新增 insertElsFromSta、删除 delElsFromSta
export const elsFromSta = (action, param) =>
  request({
    url: `${prefix}/rest/ElsFromStaService/${action}`,
    method: 'post',
    data: { ...param }
  });

// 列表 queryElsFromColumnSta、保存（新增、更新、删除） delElsFromColumnSta
export const elsFromColumnSta = (action, param) =>
  request({
    url: `${prefix}/rest/ElsFromColumnStaService/${action}`,
    method: 'post',
    data: { ...param }
  });
