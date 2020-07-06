import axios from './request';

// 获取登录信息
export const login = (params) => {
  return axios({
    url: `/apis/ElsAuthService/login`,
    method: 'post',
    data: {
      ...params
    }
  });
};
