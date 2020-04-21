<template>
  <div>
    <template v-if="list && list.length">
      <el-tabs v-model="active">
        <template v-for="subItem in list">
          <el-tab-pane :label="subItem.label" :name="subItem.prop" :key="subItem.prop">
            <RenderDynamicTab @updateLayout="updateTabLayoutOption" :api="subItem.version">
              <template slot-scope="component">
                <fast2-component-render
                  :ProviderData="subItem.data"
                  :list="component.blockList"
                ></fast2-component-render> </template
            ></RenderDynamicTab> </el-tab-pane></template
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
import RenderDynamicTab from './widget/block-provider';

const BLOCK_TYPE = {
  LIST: 'crud',
  FORM: 'form',
  DETAIL: 'detail',
  FIELD: 'field',
  BUTTONS: 'button',
  COMPONENT: 'block',
  DYNAMIC: 'dynamicBlock'
};

export default {
  name: 'TabRender',
  components: { RenderDynamicTab },
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    ProviderData: {
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
      BLOCK_TYPE,
      tableObj: {},
      tableData: {},
      active: ''
    };
  },
  mounted() {
    console.log('启动tab组件');
    this.active = this.list[0].prop;
  },
  methods: {
    listRowUpdate(row, index, done, loading) {
      // 行修改
      this.$set(this.ProviderData.tableData, index, row);
      loading();
      this.$emit('change', this.ProviderData);
      done();
    },
    listRowSave(payload, done) {
      this.ProviderData.tableData.push(payload);
      this.$emit('change', this.ProviderData);
      done();
    },
    listRowDel(payload) {
      this.ProviderData.tableData.splice(payload.index, 1);
    }
  }
};
</script>
<style scoped></style>
