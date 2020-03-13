import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Avue from '@smallwei/avue';
import '@smallwei/avue/lib/index.css';
import axios from './router/axios';
import VueAxios from 'vue-axios';

Vue.use(VueAxios, axios);
Vue.use(ElementUI);
Vue.use(Avue);
Vue.config.productionTip = false;

new Vue({
  router,
  render: function(h) {
    return h(App);
  }
}).$mount('#app');
