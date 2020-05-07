<template>
  <div class="tabBox">
    <template v-if="list && list.length">
      <el-tabs v-model="active">
        <template v-for="subItem in list">
          <el-tab-pane :label="subItem.label" :name="subItem.prop" :key="subItem.prop">
            <fast2-block-provider :version="subItem.version">
              <template v-slot="component">
                <fast2-component-render :providerData="providerData" :list="component.list">
                </fast2-component-render> </template
            ></fast2-block-provider> </el-tab-pane></template
      ></el-tabs>
    </template>
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

export default {
  name: 'item-block-tabs',
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
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
  data() {
    return {
      tableObj: {},
      tableData: {},
      active: ''
    };
  },
  mounted() {
    console.log('启动tab组件');
    this.active = this.list[0].prop;
  }
};
</script>
<style scoped>
.tabBox {
  background-color: #fff;
}
</style>
