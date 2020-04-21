<template>
  <div>
    <avue-crud ref="crud" :option="myOption" :data="list">
      <template slot="url">
        <div><a>上传</a> / <a>下载</a></div>
      </template>
      <template slot="menu">
        <div>下载</div>
      </template>
    </avue-crud>
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
import RenderDynamicTab from '../widget/block-provider';

export default {
  name: 'item-attachment',
  components: { RenderDynamicTab },
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    setting: {
      type: Array,
      default: () => {
        return [];
      }
    },
    option: {
      type: Object,
      default: () => {
        return {
          addBtn: true,
          editBtn: false,
          columnBtn: false,
          filterBtn: false,
          page: false,
          column: [
            { label: '附件类型', prop: 'label' },
            { label: '附件说明', prop: 'desc' },
            { label: '上传下载', prop: 'url', type: 'upload', slot: true }
          ]
        };
      }
    }
  },
  data() {
    return {
      tableObj: {},
      tableData: {}
    };
  },
  mounted() {
    console.log('启动tab组件');
  },
  computed: {
    myOption() {
      let setting = this.setting.data.fieldData;
      let addBtn = !(!setting.addable || setting.addable === 'false');
      let option = this.option;
      option.addBtn = addBtn;
      option.delBtn = addBtn;
      return option;
    }
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
