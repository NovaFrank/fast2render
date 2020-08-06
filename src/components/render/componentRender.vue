<template>
  <div>
    <el-container>
      <el-main>
        <template v-for="item in list">
          <template v-if="!item.hide">
            {{ ProviderData.fieldData }} {{ ProviderData.tableData }}
            <template v-if="item.type === BLOCK_TYPE.BUTTONS">
              <!-- <avue-button-group :key="item.slug" :option="item.data"></avue-button-group> -->
            </template>
            <!-- <template v-else-if="item.type === BLOCK_TYPE.DETAIL">
              <fast2-render
                :key="item.slug"
                :option="item.data"
                :data="ProviderData.fieldData"
              ></fast2-render>
            </template> -->
            <template
              v-else-if="item.type === BLOCK_TYPE.FORM || item.type === BLOCK_TYPE.FIELD"
              slot="item-from"
            >
              <div :key="item.slug">
                <slot name="detail-header"></slot>
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
                <slot name="detail-footer"></slot>
              </div>
            </template>
            <template v-else-if="item.type === BLOCK_TYPE.LIST">
              <div :key="item.slug">
                <slot name="crud-header"></slot>
                <avue-crud
                  :option="item.data"
                  @row-save="listRowSave"
                  @row-del="listRowDel"
                  @row-update="listRowUpdate"
                  :data="ProviderData.tableData"
                  v-model="tableData"
                  v-on="$listeners"
                  ref="table"
                  ><slot name="crud-slot"></slot>
                </avue-crud>
                <slot name="crud-footer"></slot>
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
      </el-main>
    </el-container>
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
const BLOCK_TYPE = {
  LIST: 'crud',
  FORM: 'form',
  DETAIL: 'detail',
  FIELD: 'field',
  BUTTONS: 'button',
  COMPONENT: 'block'
};

export default {
  name: 'ComponentRender',
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
      done();
    },
    listRowSave(payload, done) {
      this.ProviderData.tableData.push(payload);
      done();
    },
    listRowDel(payload) {
      this.ProviderData.tableData.splice(payload.index, 1);
    }
  }
};
</script>
<style scoped></style>
