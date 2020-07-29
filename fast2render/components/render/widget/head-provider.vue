<template>
  <div class="head-list">
    <avue-form
      ref="form"
      :option.sync="finalOption"
      v-model="data"
      v-on="$listeners"
      @row-del="rowDeleteMaterialList"
      @row-update="rowUpdateMaterialList"
    >
      <template v-for="item in itemLinkList" :slot="item.prop">
        <el-tag v-if="readOnly" :key="item.prop" @click.stop="go(item, data)">
          {{ data[item.prop] }}</el-tag
        >
        <component
          v-else
          :key="item.prop"
          :is="item.component"
          :seleted.sync="data[item.prop]"
          @selectDone="doSelect(item.func, data, $event, item.params)"
        ></component>
      </template>
    </avue-form>
  </div>
</template>
<script>
import { getApiPath } from '../../../lib/utils.js';
import { validateNull } from '../../../lib/validate';
import { getUserInfo } from '../../../lib/auth';
import { ElsTemplateConfigService } from '../../../lib/api/materials';

const baseUrl = getApiPath();

export default {
  name: 'HeadProvider',
  props: {
    businessModule: {
      type: String,
      default: 'requisition' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    businessType: {
      type: String,
      default: '' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    elsAccountStation: {
      type: String,
      default: '' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    status: {
      type: String,
      default: 'new' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    readOnly: {
      type: Boolean,
      default: false // 是否只读模式
    },
    col: {
      type: Number,
      default: 0
    },
    rowPermission: {
      type: Object,
      default: function() {
        return {};
      }
    },
    originColumn: {
      type: Object,
      default: function() {
        return [];
      }
    },
    itemLinkList: {
      type: Array,
      default: function() {
        return [
          {
            label: '验厂单',
            prop: 'inspectionAccess',
            url: '/admission/#/inspectTableAudit/detail/'
          },
          { label: '资质准入', prop: 'aptitudesAccess', url: '/admission/#/sampleAudit/view/' },
          { label: '样品准入', prop: 'auditAccess', url: '/admission/#/auditAdmission/view/' },
          {
            label: '物料',
            prop: 'materialNumber',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-material',
            func: 'selectedRowMaterails',
            params: []
          },
          {
            label: '采购组',
            prop: 'purchaseGroup',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-purchase-group',
            func: 'saveSelected',
            params: ['purchaseGroup', 'purchaseGroupDesc', 'orgId', 'orgDesc']
          },
          {
            label: '采购组织',
            prop: 'purchaseOrganization',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-purchase-organization',
            func: 'saveSelected',
            params: ['purchaseOrganization', 'purchaseOrganizationDesc', 'orgId', 'orgDesc']
          },
          {
            label: '期望供应商',
            prop: 'expectSupplierEls',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-supplier',
            func: 'saveSelected',
            params: [
              'expectSupplierEls',
              'expectSupplierElsName',
              'toElsAccount',
              'toElsAccountName'
            ]
          },
          {
            label: '公司代码',
            prop: 'companyCode',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-supplier',
            func: 'saveSelected',
            params: ['companyCode', 'companyCodeName', 'toElsAccount', 'toElsAccountName']
          },
          {
            label: '供应商',
            prop: 'toElsAccount',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-supplier',
            func: 'saveSelected',
            params: ['toElsAccount', 'toElsAccountName', 'toElsAccount', 'toElsAccountName']
          },
          {
            label: '采购负责人',
            prop: 'purchasePerson',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-employee',
            func: 'saveSelected',
            params: ['purchasePerson', 'purchasePersonName', 'subElsAccount', 'name']
          },
          {
            label: '采购工厂',
            prop: 'purchaseFactory',
            url: '/masterdata/material/#/masterdata/view/',
            component: 'fast2-select-factory',
            func: 'saveSelected',
            params: ['purchaseFactory', 'purchaseFactoryName', 'toElsAccount', 'toElsAccountName']
          }
        ];
      }
    },
    option: {
      type: Object,
      default: function() {
        return { column: [] };
      }
    },
    data: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  async created() {
    if (this.readOnly) {
      this.finalOption.detail = true;
      this.finalOption.column[0] = {
        label: '业务类型',
        prop: 'businessTypeName',
        type: 'input',
        span: 6
      };
    }
    this.loadConfigruations();
  },
  watch: {
    'data.businessType'(newVal) {
      this.setHeadColumns(newVal);
      this.setTableColumns(newVal);
    }
  },
  data() {
    return {
      finalOption: {
        menuBtn: false,
        submitBtn: false,
        clearBtn: false,
        column: [
          {
            label: '业务类型',
            prop: 'businessType',
            type: 'select',
            span: 6
          }
        ]
      },

      reload: false,
      formSlots: [],
      optionHash: '',
      typeDicts: [],
      typeData: [],
      seleted: {},
      configurations: {}
    };
  },
  methods: {
    saveSelected(row, list, params) {
      const item = list[0];
      row[params[0]] = item[params[2]];
      row[params[1]] = item[params[3]];
    },
    checkForm(callback, failback) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          callback && callback();
        } else {
          failback && failback();
          return false;
        }
      });
    },
    setHeadColumns(val) {
      const selected = this.configurations[val];
      if (selected) {
        this.seleted = selected;
        this.updateCoumn(selected);
      }
    },
    updateCoumn(selected) {
      const column = this.finalOption.column;
      const form = this.$refs?.form;
      column.length = 1;
      const newColumn = this.filterColum(selected.fieldColumns);
      const waitUpdateDic = [];
      newColumn.map((item) => {
        column.push(item);
        if (item.dicUrl) {
          waitUpdateDic.push(item.prop);
        }
      });
      waitUpdateDic.map((prop) => {
        if (form) {
          form.updateDic(prop);
        }
      });
    },
    setTableColumns(val) {
      const selected = this.configurations[val];
      this.$emit('updateType', selected);
    },
    doSelect(func, row, event, params = []) {
      this[func](row, event, params);
      this.$forceUpdate();
    },
    loadConfigruations() {
      let fieldPermission = {};
      let tablePermission = {};
      let defaultNumber = '';
      ElsTemplateConfigService.list({
        elsAccount: getUserInfo().elsAccount,
        businessModule: this.businessModule,
        currentVersionFlag: 'Y'
      })
        .then((res) => {
          const TypeDicts = [];
          const configurations = [];
          if (
            res.data &&
            res.data.statusCode === '200' &&
            res.data.message === 'response OK' &&
            res.data.pageData
          ) {
            const rows = res.data.pageData.rows || [];
            const userStation = this.elsAccountStation || '';
            defaultNumber = rows[0].templateNumber;
            this.data.businessType = defaultNumber;
            const TypeData = {};

            for (const item of rows) {
              const configJson = item.configJson || [];

              const json = JSON.parse(configJson);

              const field = json.field;
              const fieldJson = json.fieldJson || {};

              const table = json.table;
              const tableJson = json.tableJson || {};

              fieldPermission = fieldJson[userStation] || {};
              tablePermission = tableJson[userStation] || {};

              TypeData[item.templateNumber] = {
                typeName: item.templateName
              };

              TypeDicts.push({
                value: item.templateNumber,
                label: item.templateName
              });

              configurations[item.templateNumber] = {
                name: item.templateName,
                fieldColumns: field,
                fieldPermission: fieldPermission,
                tableColumns: table,
                tablePermission: tablePermission
              };
            }

            this.typeData = TypeData;
            this.typeDicts = TypeDicts;

            this.configurations = configurations;

            // this.setConfiurationFormValues(-1);
          } else {
            this.typeDicts = TypeDicts;
            console.log('query purchase rquestion cofiguration fail', res.data);
            this.$message.error('查找单据类型数据失败, ' + res.data.message || '');
          }

          // 默认加载
          if (this.data.businessType) {
            this.setHeadColumns(this.data.businessType);
            this.setTableColumns(this.data.businessType);
          } else {
            this.setHeadColumns(defaultNumber);
            this.setTableColumns(defaultNumber);
          }
          if (this.readOnly) {
            console.log('view');
          } else {
            const form = this.$refs.form;
            form.updateDic('businessType', this.typeDicts);
          }
        })
        .catch((err) => {
          this.typeDicts = [];
          console.log('query purchase rquestion cofiguration error', err);
          this.$message.error('查找单据类型配置数据失败, ' + err.message || '');
        });
    },
    getSelectRefs(type) {
      const refs = [];
      if (!type) {
        return refs;
      }
      this.finalOption.column.map((item) => {
        const originItem = this.findObject(this.originColumn, item.prop);
        if (originItem.ref && originItem.ref.includes(type)) {
          refs.push(item.prop);
        }
      });
      console.log('赋值列表', refs);
      return refs;
    },
    checkDataType(originItem, item) {
      if (!originItem || originItem === -1) {
        return false;
      }
      Object.assign(item, originItem);
      switch (item.datatype) {
        case 'readonly':
        case 'popupName':
          item.disabled = 'disabled';
          break;
        case 'date':
          item.type = 'date';
          item.format = 'yyyy-MM-dd';
          item.valueFormat = 'timestamp';
          break;
        case 'datetime':
          item.type = 'datetime';
          item.format = 'yyyy-MM-dd HH:mm:ss';
          item.valueFormat = 'timestamp';
          break;
        case 'price':
          item.type = 'number';
          item.precision = 2;
          break;
        case 'bizDic':
          item.type = 'select';
          item.bizDic = item.bizDic || item.prop;
          break;
        default:
      }
      if (originItem.datatype === 'popup' && !originItem.ref) {
        item.formslot = true;
      }
      if (originItem.ref) {
        item.disabled = 'disabled';
      }
      if (item.isSystem === 'Y' && this.status === 'new') {
        item.display = false;
        item.rules = [];
      }
      if (!validateNull(item.bizDic)) {
        delete item.dicData;
        delete item.dicMethod;
        delete item.props;
        item.type = 'select';
        item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
      }
    },
    filterColum(column) {
      column.map((item) => {
        const itemProp = this.seleted.fieldPermission[item.prop];
        const originItem = this.findObject(this.originColumn, item.prop);
        this.checkDataType(originItem, item);
        if (itemProp) {
          if (itemProp.display && itemProp.display !== false) {
            let label = item.label;
            if (itemProp.displayName) {
              item.label = itemProp.displayName;
              label = itemProp.displayName;
            }
            const isRequired = !!itemProp.isRequired;
            if (isRequired) {
              const rule = {
                required: true,
                message: '请输入' + label,
                trigger: 'blur'
              };
              if (item.rules) {
                item.rules.push(rule);
              } else {
                item.rules = [rule];
              }
            }
            if (!validateNull(itemProp.bizDic)) {
              delete item.dicData;
              delete item.dicMethod;
              delete item.props;
              item.type = item.type || 'select';
              item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${itemProp.bizDic}`;
            }
            if (
              itemProp.isDisabled ||
              itemProp.readonly ||
              item.ref ||
              item.disabled === 'disabled'
            ) {
              item.disabled = 'disabled';
              item.cell = false;
              item.rules = [];
            } else {
              item.cell = true;
            }
            if (this.readOnly) {
              item.type = 'text';
            }
            item.display = true;
            item.span = 6;
          }
        }
        console.log(item, originItem, '更新后的item');
      });
      return column;
    }
  }
};
</script>
<style>
.row-list .avue-crud__menu {
  display: none;
}
</style>
