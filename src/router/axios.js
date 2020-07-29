/**
 * 全站http配置
 *
 * axios参数说明
 * isSerialize是否开启form表单提交
 * isToken是否需要token
 */
import axios from 'axios';
import { Message } from 'element-ui';
import website from '@/const/website';

axios.defaults.timeout = 10000;
// 返回其他状态吗
axios.defaults.validateStatus = function(status) {
  return status >= 200 && status <= 500; // 默认的
};
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true;
// HTTPrequest拦截
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// HTTPresponse拦截
axios.interceptors.response.use(
  (res) => {
    const status = res.data.code || 200;
    const statusWhiteList = website.statusWhiteList || [];
    const message = res.data.msg || '未知错误';
    // 如果在白名单里则自行catch逻辑处理
    if (statusWhiteList.includes(status)) return Promise.reject(res);
    // 如果请求为非200否者默认统一处理
    if (status !== 200) {
      Message({
        message: message,
        type: 'error'
      });
      return Promise.reject(new Error(message));
    }
    return res;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

export default axios;
