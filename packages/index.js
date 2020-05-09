import Fast2Render from './components/render/widget/fast2render.vue';
import ComponentRender from './components/render/componentRender.vue';
import ComponentItemRender from './components/render/componentItemRender.vue';

import TabRender from './components/render/tabRender';
import ButtonGroupRender from './components/render/widget/render-button-group';
import BlockProvider from './components/render/widget/block-provider';
import PageProvider from './components/render/widget/page-provider';
import ThemeProvider from './components/render/widget/theme-provider';
import ConfigTabRender from './components/render/widget/render-config-tab';
import ConfigTabSettingRender from './components/render/widget/render-config-tab-setting';
import TemplateProvider from './components/render/widget/template-provider';
import PageHeader from './components/render/widget/page-header';
import util, { loadDic, getDicItem } from './lib/utils';
import auth from './lib/auth';
import SelectDialog from './components/render/selectDialog/selectDialog';
import SelectDialogTable from './components/render/selectDialog/selectDialogTable';

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
    Vue.component('Fast2' + ConfigTabRender.name, ConfigTabRender);
    Vue.component('Fast2' + ConfigTabSettingRender.name, ConfigTabSettingRender);
    Vue.prototype.$loadDic = loadDic;
    Vue.prototype.$getDicItem = getDicItem;
    Vue.prototype.$util = util;
    Vue.prototype.$auth = auth;
    Vue.component(ButtonGroupRender.name, ButtonGroupRender);
    Vue.component(PageHeader.name, PageHeader);
    Vue.component(SelectDialog.name, SelectDialog);
    Vue.component(SelectDialogTable.name, SelectDialogTable);
  }
};
