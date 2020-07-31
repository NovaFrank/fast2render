<template>
  <div>
    <template v-for="item in list">
      <template
        v-if="
          item &&
          !item.hide &&
          (item.type === BLOCK_TYPE.DETAIL ||
            item.type === BLOCK_TYPE.FORM ||
            item.type === BLOCK_TYPE.FIELD)
        "
      >
        <div :key="item.slug">
          <slot name="form-header"></slot>
          <fast2-theme-provider
            :option="item.data"
            :readOnly="readOnly"
            :inTab="inTab"
            type="form"
            :hasRowPermission="hasFieldPermission"
            :rowPermission="getRowPermission(permission.fieldJson)"
            :formulas="permission.formulas"
            theme="block"
            ref="themebox"
          >
            <template v-slot="component">
              <avue-form
                v-if="component.reload"
                :option="component.option"
                v-model="providerData.formData"
                :ref="item.slug"
              >
                <slot name="form-slot"></slot>
              </avue-form>
            </template>
          </fast2-theme-provider>
          <slot name="form-footer"></slot>
        </div>
      </template>
      <template v-else-if="item && !item.hide && item.type === BLOCK_TYPE.LIST">
        <div :key="item.slug">
          <ThemeProvider
            :option="item.data"
            :readOnly="readOnly"
            :hasRowPermission="hasRowPermission"
            :rowPermission="getRowPermission(permission.tableJson)"
            :addInCell="addInCell"
            :itemLinkList="itemLinkList"
            type="crud"
            :formulas="permission.formulas"
            theme="block"
          >
            <template v-slot="component">
              <slot name="crud-header">
                <h4 v-if="!readOnly">
                  <el-button size="mini" @click="listRowAdd">新增行</el-button>
                </h4>
              </slot>
              <avue-crud
                v-if="inited"
                :option="component.option"
                @row-save="listRowSave"
                @row-del="listRowDel"
                @row-update="listRowUpdate"
                :data="providerData.tableData"
                v-model="tableData"
                ref="table"
              >
                <template v-for="item in itemLinkList" :slot="item.prop" slot-scope="scope">
                  <el-tag
                    :key="item.prop"
                    v-if="scope.row[item.prop]"
                    @click.stop="go(item, scope.row)"
                  >
                    {{ scope.row[item.prop] }}</el-tag
                  >
                </template>
              </avue-crud>
              <slot name="crud-footer"></slot>
            </template>
          </ThemeProvider>
        </div>
      </template>
      <template v-else-if="item && !item.hide && item.type === BLOCK_TYPE.DYNAMIC">
        <div :key="item.slug">
          <component
            :is="getComponent(item.type, item.component)"
            :readOnly="readOnly"
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
import { getRowPermission } from '../../lib/utils';
import { validateNull } from '../../lib/validate';
import ThemeProvider from './widget/theme-provider';

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
  components: { itemAttachment, ThemeProvider },
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
    readOnly: {
      type: Boolean,
      default: false
    },
    itemLinkList: {
      type: Array,
      default: function () {
        return [
          {
            label: '验厂单',
            prop: 'inspectionAccess',
            url: '/admission/#/inspectTableAudit/detail/'
          },
          { label: '资质准入', prop: 'aptitudesAccess', url: '/admission/#/sampleAudit/view/' },
          { label: '样品准入', prop: 'auditAccess', url: '/admission/#/auditAdmission/view/' }
        ];
      }
    },
    addInCell: {
      type: Boolean,
      default: false
    },
    inTab: {
      type: Boolean,
      default: false
    },
    permission: {
      type: Object,
      default: () => {
        return {
          tableJson: [],
          fieldJson: [],
          formulas: []
        };
      }
    },
    providerData: {
      type: Object,
      default: () => {
        return {
          tableData: [],
          formData: {}
        };
      }
    }
  },
  data() {
    return {
      BLOCK_TYPE,
      tableObj: {},
      tableData: [],
      formData: {},
      lockCalc: false,
      inited: false
    };
  },
  computed: {
    hasRowPermission() {
      if (validateNull(this.permission)) {
        return false;
      }
      return !validateNull(this.permission.tableJson);
    },
    hasFieldPermission() {
      if (validateNull(this.permission)) {
        return false;
      }
      return !validateNull(this.permission.fieldJson);
    }
  },
  watch: {
    readOnly: function () {
      this.initList();
    }
  },
  created() {},
  mounted() {
    this.initList();
    if (!this.readOnly) {
      // this.watchList();
    }
  },
  methods: {
    initList() {
      this.list = this.list.map((item) => {
        item.data.labelPosition = 'top';
        item.data.submitBtn = false;
        if (this.readOnly) {
          item.data.detail = true;
        } else {
          item.data.menuBtn = false;
        }
        return item;
      });
      this.inited = true;
      this.$nextTick(() => {
        if (!this.$refs.table || !this.$refs.table[0]) {
          return false;
        }
        const list = this.$refs.table[0].option?.column;
        this.itemLinkList.map((item) => {
          const linkItem = this.findObject(list, item.prop);
          if (linkItem) {
            linkItem.slot = true;
          }
        });
      });
    },
    go(item, row) {
      if (window?.parent) {
        const router = {
          name: item.label,
          src: item.url + row[item.prop]
        };
        const event = {
          name: 'openNewTag',
          props: router
        };
        console.log('测试跳转事件', event);
        window.parent.postMessage(event, '*');
      } else {
        window.location.href = item.url;
      }
    },
    listRowUpdate(row, index, done, loading) {
      // 行修改
      const calcPayload = this.checkFormFormulas(row);
      this.$set(this.providerData.tableData, index, calcPayload);
      loading();
      this.updateRootTable(this.providerData.tableData);
      done();
    },
    listRowSave(payload, done) {
      const calcPayload = this.checkFormFormulas(payload);
      this.providerData.tableData.push(calcPayload);
      this.updateRootTable(this.providerData.tableData);
      done();
    },
    listRowDel(payload, index) {
      this.providerData.tableData.splice(index, 1);
      this.updateRootTable(this.providerData.tableData);
    },
    checkFormulas(data = this.providerData.tableData) {
      if (this.permission.formules && data.length) {
        //  console.log(this.permission.formules, '要执行的权限方法');
        //  console.log(data, '要执行的权限对象');
        // 进行公式计算
        const list = this.$util.doListCalc(this.permission.formules, data);
        this.providerData.tableData = list;
        console.log('计算结果', this.providerData.tableData);
        this.lockCalc = false;
        // 打开允许计算
      }
    },
    checkFormFormulas(data) {
      if (this.permission.formules && data) {
        const obj = this.$util.doCalc(this.permission.formules, data);
        return obj;
      }
      return data;
    },
    listRowAdd() {
      if (this.addInCell) {
        const lenth = this.providerData.tableData.length;
        if (!this.lockCalc) {
          this.providerData.tableData.splice(lenth + 1, 0, { $cellEdit: true });
        } else {
          setTimeout(this.listRowAdd, 1000);
        }
      } else {
        this.$refs.table[0].rowAdd();
      }
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
    getRowPermission(data) {
      return getRowPermission(data);
    },
    getComponent(type, component) {
      const KEY_COMPONENT_NAME = 'item-';
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
