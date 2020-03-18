import axios from 'axios';
// import request from '@/router/axios';
let prefix = '/apis';
// const baseUrl = 'https://cs.51qqt.com/qqt-srm/rest/';

export const getList = (elsAccount, param) => {
  // 订单管理列表页面 获取 列表数据，删除delData，获取订单详情页面getDetailList，订单详情页面 (行增加、修改与删除)handleData
  return axios({
    url: `${prefix}/OrderService/findPageList`,
    method: 'post',
    data: {
      elsAccount,
      ...param
    }
  });
};
