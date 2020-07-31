import Vue from 'vue';
import App from './App.vue';
import routes from './router';
import ElementUI from 'element-ui';
import store from './store';
import './public-path';
import i18n from '../locales';
import Avue from '@smallwei/avue';
import './styles/common.scss';
import 'element-ui/lib/theme-chalk/index.css';
import '@smallwei/avue/lib/index.css';
import Fast2Render from 'fast2render';
import basicContainer from './components/basic-container/main';
import { getCommonRes } from '@/util/commonRes';

Vue.use(Fast2Render);

Vue.use(ElementUI);
Vue.use(Avue);

// 注册全局容器
Vue.component('basicContainer', basicContainer);
Vue.prototype.$GetCommon = getCommonRes;
Vue.config.productionTip = false;

let router = null;
let instance = null;

function storeTest(props) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
      true
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name
      }
    });
}

function render(props = {}) {
  const { container } = props;
  router = routes;
  instance = new Vue({
    router,
    store,
    i18n,
    render: (h) => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
}

export async function mount(props) {
  console.log('[vue] props from main framework', props);
  storeTest(props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance = null;
  router = null;
}
