<template>
  <div>
    <slot></slot>
    <template v-for="item in list">
      <template v-if="!item.hide">
        <template v-if="item.type === BLOCK_TYPE.DETAIL">
          <div :key="item.slug">
            <slot name="detail-header"></slot>
            <avue-detail
              :option="item.data"
              v-model="ProviderData.fieldData"
              :ref="item.slug"
              v-on="$listeners"
              ><slot name="form-slot"></slot>
              <slot name="detail-slot"></slot>
            </avue-detail>
            <slot name="detail-footer"></slot>
          </div>
        </template>
        <template v-if="item.type === BLOCK_TYPE.FORM || item.type === BLOCK_TYPE.FIELD">
          <div :key="item.slug">
            <slot name="form-header"></slot>
            <avue-form
              :option="item.data"
              v-model="ProviderData.fieldData"
              :ref="item.slug"
              v-on="$listeners"
              ><slot name="form-slot"></slot>
              <slot name="detail-slot"></slot>
            </avue-form>
            <slot name="form-footer"></slot>
          </div>
        </template>
        <template v-else-if="item.type === BLOCK_TYPE.LIST">
          <div :key="item.slug">
            <fast2-theme-provider :option="item.data" theme="block" ref="themebox"
              ><template slot-scope="component">
                <slot name="crud-header">
                  <h4>
                    {{ item.name }} <el-button size="mini" @click="listRowAdd">新增行</el-button>
                  </h4>
                </slot>
                <avue-crud
                  :option="component.option"
                  @row-save="listRowSave"
                  @row-del="listRowDel"
                  @row-update="listRowUpdate"
                  :data="ProviderData.tableData"
                  v-model="tableData"
                  v-on="$listeners"
                  ref="table"
                  ><slot name="crud-slot"></slot>
                </avue-crud>
                <slot name="crud-footer"></slot> </template
            ></fast2-theme-provider>
          </div>
        </template>
        <template v-else-if="item.type === BLOCK_TYPE.COMPONENT">
          <div :key="item.slug">
            <slot name="component-header"></slot>
            <fast2-component-render
              :componentsList="item.data"
              :ProviderData="ProviderData.componentData"
              v-on="$listeners"
            ></fast2-component-render>
            <slot name="component-footer"></slot>
          </div>
        </template>
        <template v-else-if="item.type === BLOCK_TYPE.DYNAMIC">
          <div :key="item.slug">
            <component
              :is="getComponent(item.type, item.component)"
              :list="item.data"
              :ProviderData="ProviderData.dynamicTabData"
              v-on="$listeners"
            ></component>
          </div>
        </template>
        <template v-else>
          <div :key="item.slug">
            <h5>无法解析数据：</h5>
            <code>
              {{ item }}
            </code>
          </div>
        </template>
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
import itemTab from './cards/item-tab';
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
  components: { itemTab, itemAttachment },
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
      tableData: {}
    };
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
    },
    listRowAdd() {
      this.$refs.table[0].rowAdd();
    },
    getComponent(type, component) {
      let KEY_COMPONENT_NAME = 'item-';
      let result = 'normal';
      if (!this.validatenull(component)) result = component;
      else if (type === 'attachment') result = type;
      else if (type === 'block-tabs') result = 'tab';
      this.mycomponent = KEY_COMPONENT_NAME + result;
      return this.mycomponent;
    }
  }
};
</script>
<style scoped></style>
