/**
 * 全局配置文件
 */
export default {
  title: '',
  logo: 'Q',
  indexTitle: '',
  lockPage: '/lock',
  tokenTime: 86400,
  info: {
    title: '',
    list: []
  },
  appURL: '',
  // http的status默认放行不才用统一处理的,
  statusWhiteList: [400, 401],
  // 配置首页不可关闭
  isFirstPage: false,
  fistPage: {
    label: '',
    value: '/',
    params: {},
    query: {},
    group: [],
    close: false
  }
};
