import Fast2Render from './components/render/widget/fast2render.vue';
import ComponentRender from './components/render/componentRender.vue';
import ComponentItemRender from './components/render/componentItemRender.vue';
import TabRender from './components/render/tabRender';
import ButtonGroupRender from './components/render/widget/render-button-group';
import BlockProvider from './components/render/widget/block-provider';
import PageProvider from './components/render/widget/page-provider';
import ThemeProvider from './components/render/widget/theme-provider';
import RowProvider from './components/render/widget/row-provider'; // 单据行项目专用组件
import RowPageProvider from './components/render/widget/row-page-provider'; // 单据行项目专用组件
import HeadProvider from './components/render/widget/head-provider'; // 业务类型单据头专用组件
import HeadPageProvider from './components/render/widget/head-page-provider'; // 模块单据头专用组件
import SearchProvider from './components/render/widget/search-provider'; // 业务类型单据头专用组件
import ConfigTabRender from './components/render/widget/render-config-tab';
import CostConfigTabRender from './components/render/widget/render-cost-config-tab';
import ConfigTabSetting from './components/render/widget/setting-config-tab';
import TemplateProvider from './components/render/widget/template-provider';
import PageHeader from './components/render/widget/page-header';
import PageListHeader from './components/render/widget/page-list-header';
import PageDetailHeader from './components/render/widget/page-detail-header';
import BusinessRuleConfig from './components/render/widget/render-rule-config';
import AttachmentList from './components/render/attachmentList';
import auth from './lib/auth';
import SelectDialog from './components/render/selectDialog/selectDialog';
import SelectDialogTable from './components/render/selectDialog/selectDialogTable';
import Tree from './components/render/tree/index';
import Upload from './components/render/uploader';
import SelectMaterial from './components/render/dialog/material';
import SelectPurchaseGroup from './components/render/dialog/purchaseGroup';
import SelectSupplier from './components/render/dialog/supplier';
import SelectFactory from './components/render/dialog/factory';
import SelectOrder from './components/render/dialog/order';
import SelectEmployee from './components/render/dialog/employee';
import SelectPurchaseOrganization from './components/render/dialog/purchaseOrganization';
import Uploader from 'vue-simple-uploader';

import { getStore, setStore } from './lib/store';
import util, {
  loadDic,
  getDicItem,
  getTableItem,
  getTemplateItem,
  getFormulaValue,
  getFormulaItem,
  getFormulaList,
  getBlockItem,
  getBlockFieldItem,
  getTableList,
  getDicNow,
  getApiPath,
  getRowPermission,
  handlerLocalPermission,
  handlerLocalRolePermission
} from './lib/utils';

export default {
  install(Vue) {
    Vue.use(Uploader);
    Vue.component('Fast2' + Fast2Render.name, Fast2Render);
    Vue.component('Fast2' + ComponentRender.name, ComponentRender);
    Vue.component('Fast2' + ComponentItemRender.name, ComponentItemRender);
    Vue.component('Fast2' + TabRender.name, TabRender);
    Vue.component(ButtonGroupRender.name, ButtonGroupRender);
    Vue.component('Fast2' + BlockProvider.name, BlockProvider);
    Vue.component('Fast2' + PageProvider.name, PageProvider);
    Vue.component('Fast2' + TemplateProvider.name, TemplateProvider);
    Vue.component('Fast2' + ThemeProvider.name, ThemeProvider);
    Vue.component('Fast2' + RowProvider.name, RowProvider);
    Vue.component('Fast2' + RowPageProvider.name, RowPageProvider);

    Vue.component('Fast2' + HeadProvider.name, HeadProvider);
    Vue.component('Fast2' + HeadPageProvider.name, HeadPageProvider);
    Vue.component('Fast2' + SearchProvider.name, SearchProvider);
    Vue.component('Fast2' + ConfigTabRender.name, ConfigTabRender);
    Vue.component('Fast2' + CostConfigTabRender.name, CostConfigTabRender);
    Vue.component('Fast2' + ConfigTabSetting.name, ConfigTabSetting);
    Vue.component(PageHeader.name, PageHeader);
    Vue.component(PageListHeader.name, PageListHeader);
    Vue.component(PageDetailHeader.name, PageDetailHeader);
    Vue.component('Fast2' + AttachmentList.name, AttachmentList);
    Vue.component('Fast2' + Upload.name, Upload);
    Vue.component('Fast2' + SelectMaterial.name, SelectMaterial);
    Vue.component('Fast2' + SelectPurchaseGroup.name, SelectPurchaseGroup);
    Vue.component('Fast2' + SelectSupplier.name, SelectSupplier);
    Vue.component('Fast2' + SelectFactory.name, SelectFactory);
    Vue.component('Fast2' + SelectOrder.name, SelectOrder);
    Vue.component('Fast2' + SelectEmployee.name, SelectEmployee);
    Vue.component('Fast2' + SelectPurchaseOrganization.name, SelectPurchaseOrganization);

    Vue.component(AttachmentList.name, AttachmentList);
    Vue.prototype.$loadDic = loadDic;
    Vue.prototype.$getDicItem = getDicItem;
    Vue.prototype.$getDicNow = getDicNow;
    Vue.prototype.$getTableItem = getTableItem;
    Vue.prototype.$getTableList = getTableList;
    Vue.prototype.$getTemplateItem = getTemplateItem;
    Vue.prototype.$getFormulaValue = getFormulaValue;
    Vue.prototype.$getFormulaItem = getFormulaItem;
    Vue.prototype.$getFormulaList = getFormulaList;
    Vue.prototype.$getBlockItem = getBlockItem;
    Vue.prototype.$getBlockFieldItem = getBlockFieldItem;
    Vue.prototype.$util = util;
    Vue.prototype.$util.loadDic = loadDic;
    Vue.prototype.$util.getDicNow = getDicNow;
    Vue.prototype.$util.setStore = setStore;
    Vue.prototype.$util.getStore = getStore;
    Vue.prototype.$util.getApiPath = getApiPath;
    Vue.prototype.$util.getRowPermission = getRowPermission;
    Vue.prototype.$util.handlerLocalPermission = handlerLocalPermission;
    Vue.prototype.$util.handlerLocalRolePermission = handlerLocalRolePermission;

    Vue.prototype.$auth = auth;
    Vue.component(BusinessRuleConfig.name, BusinessRuleConfig);
    Vue.component(SelectDialog.name, SelectDialog);
    Vue.component(SelectDialogTable.name, SelectDialogTable);
    Vue.component(Tree.name, Tree);
  }
};
