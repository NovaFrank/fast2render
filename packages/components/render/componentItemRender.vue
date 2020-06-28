<template>
  <div>
    <slot></slot>
    <component
      :is="getComponent(item.component)"
      :list="item.data.tableData"
      :setting="item"
      :providerData="providerData.dynamicTabData"
      v-on="$listeners"
    ></component>
  </div>
</template>
<script>
/**
 * 界面配置总管理界面
 * 左侧 维护 所有可配数据列表
 * 主内容根据 可配数据类型 展示 表单，表格，详情，组件列表管理，可选择设置对应的数据
 * 进入屏蔽其他操作状态，单纯进行布局， 保存 及 发布 ， 可维护类型为 表格 表单 详情， 组合， 可 维护 模版 页面  模块
 * block 内含一组组件
 */
import itemTab from './cards/item-tab';
import itemAttachment from './cards/item-attachment';

export default {
  name: 'ComponentItemRender',
  components: { itemTab, itemAttachment },
  props: {
    item: {
      type: Object,
      default: () => {
        return {};
      }
    },
    providerData: {
      type: Object,
      default: () => {
        return {
          tableData: []
        };
      }
    }
  },
  methods: {
    getComponent(component) {
      const KEY_COMPONENT_NAME = 'item-';
      let result = 'normal';
      if (component === 'attachment') {
        result = component;
      } else if (component === 'block-tabs') {
        result = 'tab';
      }
      this.mycomponent = KEY_COMPONENT_NAME + result;
      return this.mycomponent;
    }
  }
};
</script>
<style scoped></style>
