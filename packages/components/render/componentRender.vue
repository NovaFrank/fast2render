<template>
  <div>
    <template v-for="item in list">
      <template
        v-if="
          !item.hide &&
            (item.type === BLOCK_TYPE.DETAIL ||
              item.type === BLOCK_TYPE.FORM ||
              item.type === BLOCK_TYPE.FIELD)
        "
      >
        <div :key="item.slug">
          <slot name="form-header"></slot>
          <avue-form :option="item.data" :data="providerData" v-model="formData" :ref="item.slug">
            <slot name="form-slot"></slot>
          </avue-form>
          <slot name="form-footer"></slot>
        </div>
      </template>
      <template v-else-if="!item.hide && item.type === BLOCK_TYPE.LIST">
        <div :key="item.slug">
          <fast2-theme-provider :option="item.data" theme="block" ref="themebox">
            <template v-slot="component">
              <slot name="crud-header">
                <h4>
                  <el-button size="mini" @click="listRowAdd">新增行</el-button>
                </h4>
              </slot>
              <avue-crud
                :option="component.option"
                @row-save="listRowSave"
                @row-del="listRowDel"
                @row-update="listRowUpdate"
                :data="providerData.tableData"
                v-model="tableData"
                ref="table"
              >
                <slot name="crud-slot"></slot>
              </avue-crud>
              <slot name="crud-footer"></slot>
            </template>
          </fast2-theme-provider>
        </div>
      </template>
      <template v-else-if="!item.hide && item.type === BLOCK_TYPE.DYNAMIC">
        <div :key="item.slug">
          <component
            :is="getComponent(item.type, item.component)"
            :list="item.data && item.data.tableData ? item.data.tableData : item.data"
            :providerData="providerData"
          ></component>
        </div>
      </template>
      <template v-else>
        <div :key="item.slug">
          <h5>无法解析数据：</h5>
          <code>{{ item }}</code>
        </div>
      </template>
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
import itemAttachment from './cards/item-attachment';
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
  name: 'ComponentRender',
  components: { itemAttachment },
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    dataSource: {
      type: String,
      default: null
    },
    mode: {
      type: String,
      default: null
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
      BLOCK_TYPE,
      tableObj: {},
      tableData: [],
      formData: {}
    };
  },
  watch: {
    formData: {
      handler: function(newVal) {
        this.$emit('change-form', newVal);
        this.$root.$emit('change-form', newVal);
      },
      deep: true
    }
  },
  methods: {
    listRowUpdate(row, index, done, loading) {
      // 行修改
      this.$set(this.providerData.tableData, index, row);
      loading();
      this.updateRootTable(this.providerData.tableData);
      done();
    },
    listRowSave(payload, done) {
      this.providerData.tableData.push(payload);
      this.updateRootTable(this.providerData.tableData);
      done();
    },
    listRowDel(payload) {
      this.providerData.tableData.splice(payload.index, 1);
      this.updateRootTable(this.providerData.tableData);
    },
    listRowAdd() {
      this.$refs.table[0].rowAdd();
    },
    updateRootTable(tableData) {
      let data = { tableData };
      if (this.dataSource) {
        data = {
          [this.dataSource]: tableData
        };
      }
      this.$root.$emit('change-table', data);
    },
    getComponent(type, component) {
      let KEY_COMPONENT_NAME = 'item-';
      let result = 'normal';
      if (!this.validatenull(component)) {
        result = component;
      } else if (type === 'attachment') {
        result = type;
      } else if (type === 'business-rule-config') {
        return type;
      }
      this.mycomponent = KEY_COMPONENT_NAME + result;
      return this.mycomponent;
    }
  }
};
</script>