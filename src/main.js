import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';

import Avue from '@smallwei/avue';
import fast2render from 'fast2render';
import './styles/common.scss';
import 'element-ui/lib/theme-chalk/index.css';
import '@smallwei/avue/lib/index.css';
import basicContainer from './components/basic-container/main';
import md5 from 'js-md5';

Vue.use(ElementUI);
Vue.use(Avue);
Vue.use(fast2render);
Vue.prototype.$md5 = md5;

// 注册全局容器
Vue.component('basicContainer', basicContainer);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app');
