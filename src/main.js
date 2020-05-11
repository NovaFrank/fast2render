import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Avue from '@smallwei/avue';
import '@smallwei/avue/lib/index.css';
import axios from './router/axios';
import VueAxios from 'vue-axios';
import Fast2Render from 'fast2render';
import basicContainer from './components/basic-container/main';

Vue.use(VueAxios, axios);
Vue.use(Fast2Render);
Vue.use(ElementUI);
Vue.use(Avue);
Vue.config.productionTip = false;
// 注册全局容器
Vue.component('basicContainer', basicContainer);

new Vue({
  router,
  render: function(h) {
    return h(App);
  }
}).$mount('#app');
