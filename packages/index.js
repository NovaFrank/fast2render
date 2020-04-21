import Fast2Render from './components/render/widget/fast2render.vue';
import ComponentRender from './components/render/componentRender.vue';
import ComponentItemRender from './components/render/componentItemRender.vue';

import TabRender from './components/render/tabRender';
import ButtonGroupRender from './components/render/widget/render-button-group';
import BlockProvider from './components/render/widget/block-provider';
import PageProvider from './components/render/widget/page-provider';
import ThemeProvider from './components/render/widget/theme-provider';
import TemplateProvider from './components/render/widget/template-provider';

export default {
  install(Vue) {
    Vue.component('Fast2' + Fast2Render.name, Fast2Render);
    Vue.component('Fast2' + ComponentRender.name, ComponentRender);
    Vue.component('Fast2' + ComponentItemRender.name, ComponentItemRender);
    Vue.component('Fast2' + TabRender.name, TabRender);
    Vue.component('Fast2' + ButtonGroupRender.name, ButtonGroupRender);
    Vue.component('Fast2' + BlockProvider.name, BlockProvider);
    Vue.component('Fast2' + PageProvider.name, PageProvider);
    Vue.component('Fast2' + TemplateProvider.name, TemplateProvider);
    Vue.component('Fast2' + ThemeProvider.name, ThemeProvider);

    Vue.component(ButtonGroupRender.name, ButtonGroupRender);
  }
};
