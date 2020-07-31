/**
 * 全站 http 配置
 *
 * axios 参数说明
 * isSerialize 是否开启form表单提交
 * isToken 是否需要 token
 */
import axios from 'axios';
import { Message } from 'element-ui';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import website from '@/config/website';
import { getAccount } from '@/util/utils';

axios.defaults.timeout = 10000;

// 返回其他状态吗
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status <= 500; // 默认的
};
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true;
// NProgress Configuration
NProgress.configure({
  showSpinner: false
});
// HTTP request 拦截
axios.interceptors.request.use(
  (config) => {
    const userAccount = getAccount();
    config.headers.token = userAccount.token;
    config.headers.account = `${userAccount.elsAccount}_${userAccount.elsSubAccount}`;

    NProgress.start(); // start progress bar

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// HTTPresponse拦截
axios.interceptors.response.use(
  (res) => {
    NProgress.done();
    const status = res.code || 200;
    const statusWhiteList = website.statusWhiteList || [];
    const message = res.data.msg || '未知错误';
    // 如果在白名单里则自行catch逻辑处理
    if (statusWhiteList.includes(status)) {
      return Promise.reject(res);
    }
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
    NProgress.done();
    return Promise.reject(new Error(error));
  }
);

export default axios;
