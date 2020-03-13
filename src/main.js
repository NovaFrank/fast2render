import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import store from './store';

import Avue from '@smallwei/avue';
import './styles/common.scss';
import 'element-ui/lib/theme-chalk/index.css';
import '@smallwei/avue/lib/index.css';

import basicContainer from './components/basic-container/main';

Vue.use(ElementUI);
Vue.use(Avue);

// 注册全局容器
Vue.component('basicContainer', basicContainer);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
