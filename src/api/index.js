import request from '@/router/axios';
let prefix = '/apis';

// 获取登录信息 开发使用
export const login = (params) =>
  request({
    url: `${prefix}/ElsAuthService/login`,
    method: 'post',
    data: {
      ...params
    }
  });

const commonApi = {
  login
};
export default commonApi;
