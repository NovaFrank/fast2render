/**
 * 全站http配置
 *
 * axios参数说明
 * isSerialize是否开启form表单提交
 * isToken是否需要token
 */
import axios from 'axios';
import { getAccount } from '@/util/utils';
axios.defaults.timeout = 10000;
// 返回其他状态吗
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status <= 500; // 默认的
};
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true;
// HTTPrequest拦截
axios.interceptors.request.use(
  (config) => {
    const userAccount = getAccount();
    config.headers.token = userAccount.token;
    config.headers.account = `${userAccount.elsAccount}_${userAccount.elsSubAccount}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// HTTPresponse拦截
axios.interceptors.response.use();

export default axios;
