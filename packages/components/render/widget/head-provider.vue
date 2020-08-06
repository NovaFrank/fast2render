<template>
  <div class="head-list">
    <avue-form
      v-if="isSetConfigForm"
      ref="form"
      v-model="formObj"
      :option.sync="finalOption"
      v-on="$listeners"
      @row-del="rowDeleteMaterialList"
      @row-update="rowUpdateMaterialList"
    >
      <template v-for="item in itemLinkList" :slot="item.prop">
        <el-tag v-if="readOnly" :key="item.prop" @click.stop="go(item, data)">
          {{ formObj[item.prop] }}
        </el-tag>
        <component
          :is="item.component"
          v-else
          :key="item.prop"
          :seleted.sync="formObj[item.prop]"
          :api="listApi[item.prop]"
          :list-params.sync="listParams[item.prop]"
          :is-disabled="getDisabledProperty(item.prop)"
          @selectDone="doSelect(item.func, formObj, $event, item.params)"
        />
      </template>
    </avue-form>
  </div>
</template>
<script>
import { getApiPath, getPropertiesInitValue } from '../../../lib/utils.js';
import { validateNull } from '../../../lib/validate';
import { checkDataTypeItem, checkFixDic } from '../core/utils.js';
import { getUserInfo } from '../../../lib/auth';
import { ElsTemplateConfigService } from '../../../lib/api/materials';
import popList from '../../../lib/popList';

const baseUrl = getApiPath();

export default {
  name: 'HeadProvider',
  props: {
    elsAccountStation: {
      type: String,
      default: '' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    businessModule: {
      type: String,
      default: 'requisition' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    businessType: {
      type: String,
      default: '' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    businessTypeProperty: {
      type: String,
      default: function() {
        return ''; // 用于匹配实际的业务类型数据
      }
    },
    col: {
      type: Number,
      default: 0
    },
    data: {
      type: Object,
      default: function() {
        return {};
      }
    },
    itemLinkList: {
      type: Array,
      default: function() {
        return popList;
      }
    },
    listApi: {
      type: Object,
      default: function() {
        return {};
      }
    },
    listParams: {
      type: Object,
      default: function() {
        return {};
      }
    },
    option: {
      type: Object,
      default: function() {
        return { column: [] };
      }
    },
    originColumn: {
      type: Object,
      default: function() {
        return [];
      }
    },
    readOnly: {
      type: Boolean,
      default: false // 是否只读模式
    },
    rowPermission: {
      type: Object,
      default: function() {
        return {};
      }
    },
    status: {
      type: String,
      default: 'new' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    }
  },
  data() {
    return {
      disabledProperties: {},
      isSetConfigForm: true,

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
      formObj: this.data,

      reload: false,
      formSlots: [],
      optionHash: '',

      configurations: {},

      seleted: {},
      typeDicts: [],
      typeData: []
    };
  },
  watch: {
    'formObj.businessType'(newVal, oldVal) {
      console.log(new Date().valueOf(), 'formObj.businessType', newVal, oldVal);
      if (newVal && newVal !== '') {
        this.setHeadColumns(newVal, {
          isChanged: true
        });

        this.setTableColumns(newVal);
      }
    },
    'formObj.projectType'(newVal) {
      if (newVal && newVal !== '') {
        this.$emit('projectTypeChange', newVal);
      }
    }
  },
  async created() {
    if (this.readOnly) {
      this.finalOption.detail = true;
    } else {
      this.finalOption.detail = false;
    }

    this.loadConfigruations();
  },
  methods: {
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

    doSelect(func, row, event, params = []) {
      this[func](row, event, params);
      this.$forceUpdate();
    },

    filterColum(column) {
      column.map((item) => {
        const itemProp = this.seleted.fieldPermission[item.prop];
        const originItem = this.findObject(this.originColumn, item.prop);

        checkDataTypeItem(originItem, item);
        checkFixDic(item, this.fixSeleteDic);

        if (itemProp) {
          if (itemProp.display && itemProp.display !== false) {
            let label = item.label;

            if (itemProp.displayName) {
              item.label = itemProp.displayName;
              label = itemProp.displayName;
            }
            if (itemProp.isRequired === 'Y') {
              itemProp.isRequired = true;
            } else if (itemProp.isRequired === 'N') {
              itemProp.isRequired = false;
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
            // 检查特定字段 固定处理
            if (
              itemProp.isDisabled ||
              itemProp.readonly ||
              itemProp.isReadOnly ||
              item.ref ||
              item.disabled === 'disabled'
            ) {
              item.disabled = 'disabled';
              item.cell = false;
              item.rules = [];
            } else {
              item.cell = true;
            }

            if (item.isDisabled || itemProp.isDisabled || itemProp.isReadOnly === 'Y') {
              this.disabledProperties[item.prop] = 1;
            }

            item.display = true;
            item.span = 6;
          }
        }

        // console.log(item, originItem, '更新后的item');
      });

      return column;
    },

    getData() {
      const formData = JSON.parse(JSON.stringify(this.formObj));

      // set real business type data and remove virtual business type data
      formData[this.businessTypeProperty] = formData.businessType;
      delete formData.businessType;

      return formData;
    },

    getDisabledProperty(prop) {
      return this.disabledProperties[prop] || false;
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

            if (rows.length < 1) {
              return;
            }

            defaultNumber =
              this.data.businessType ||
              this.data[this.businessTypeProperty] ||
              rows[0].templateNumber;

            const TypeData = {};

            for (const item of rows) {
              const configJson = item.configJson || '{}';

              const json = JSON.parse(configJson);

              const fields = json.field || [];
              const fieldJson = json.fieldJson || {};

              const table = json.table || [];
              const tableJson = json.tableJson || {};

              // 排除非法数据 $index
              let hasInvalidProp = false;

              for (const field of fields) {
                if (field.$index) {
                  hasInvalidProp = true;
                  break;
                }
              }

              if (hasInvalidProp) {
                continue;
              }

              for (const tbl of table) {
                if (tbl.$index) {
                  hasInvalidProp = true;
                  break;
                }
              }

              if (hasInvalidProp) {
                continue;
              }

              fieldPermission = fieldJson[userStation] || {};
              tablePermission = tableJson[userStation] || {};

              TypeData[item.templateNumber] = {
                typeName: item.templateName
              };

              TypeDicts.push({
                value: item.templateNumber,
                label: item.templateName
              });

              // 由于与 businessType 重复, 如存在则删除 businessTypeProperty 对应的属性
              let fieldIndex = 0;

              for (const fieldItem of fields) {
                if (fieldItem.prop === this.businessTypeProperty) {
                  fields.splice(fieldIndex, 1);
                  break;
                }

                fieldIndex = fieldIndex + 1;
              }

              configurations[item.templateNumber] = {
                name: item.templateName,
                fieldColumns: fields,
                fieldPermission: fieldPermission,
                tableColumns: table,
                tablePermission: tablePermission
              };
            }

            this.typeData = TypeData;
            this.typeDicts = TypeDicts;
            this.configurations = configurations;

            // TODO: 临时观察数据
            console.log('configurations', configurations);

            // this.setConfiurationFormValues(-1);
          } else {
            this.typeDicts = TypeDicts;
            console.log('query purchase rquestion cofiguration fail', res.data);
            this.$message.error('查找单据类型数据失败, ' + res.data.message || '');
          }

          if (!this.formObj.businessType) {
            this.formObj.businessType = defaultNumber;
          }

          const form = this.$refs.form;

          if (form && form.updateDic) {
            form.updateDic('businessType', this.typeDicts);
          }

          this.setHeadColumns(defaultNumber, {
            isChanged: false
          });

          this.setTableColumns(defaultNumber);
        })
        .catch((err) => {
          this.typeDicts = [];
          console.log('query purchase rquestion cofiguration error', err);
          this.$message.error('查找单据类型配置数据失败, ' + err.message || '');
        });
    },

    saveSelected(row, list, params) {
      const item = list[0];
      const ref = params[0];
      const propMacth = this.propMatch;
      row[params[0]] = item[params[2]];
      row[params[1]] = item[params[3]];
      if (propMacth && propMacth.length) {
        propMacth.map((matchitem) => {
          if (matchitem.ref === ref) {
            row[matchitem.to] = item[matchitem.from];
          }
        });
      }
    },

    setHeadColumns(businessTypeValue, option = null) {
      const selected = this.configurations[businessTypeValue];

      if (selected) {
        this.seleted = selected;

        this.updateCoumn(businessTypeValue, selected, option);
      }
    },

    setTableColumns(val) {
      const selected = this.configurations[val];
      this.$emit('updateType', selected);
    },

    updateCoumn(businessTypeValue, selected, option = {}) {
      this.isSetConfigForm = false;

      const isChanged = option.isChanged;

      const columns = this.finalOption.column;

      columns.length = 1;

      const newColumn = this.filterColum(selected.fieldColumns);

      const waitUpdateDic = [];

      newColumn.map((item) => {
        columns.push(item);

        if (item.dicUrl) {
          waitUpdateDic.push(item.prop);
        }
      });

      if (isChanged === true) {
        const formEmptyValue = getPropertiesInitValue(columns, 'prop', '');
        formEmptyValue.businessType = businessTypeValue;

        this.formObj = formEmptyValue;
      }

      this.$nextTick(() => {
        this.isSetConfigForm = true;

        this.$nextTick(() => {
          this.updateFormDict(waitUpdateDic);
        });
      });
    },

    updateFormDict(dicts) {
      const form = this.$refs.form;

      if (form && form.updateDic) {
        form.updateDic('businessType', this.typeDicts);
      }

      if (form && form.updateDic) {
        dicts.map((prop) => {
          form.updateDic(prop);
        });
      }
    }
  }
};
</script>
<style>
.row-list .avue-crud__menu {
  display: none;
}
.head-list .el-form-item__label {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  width: auto !important;
}
.head-list .el-form-item__content {
  position: relative;
  display: block;
  flex: 1;
  width: auto;
  margin-left: 0 !important;
}
.head-list .el-form-item {
  display: flex;
}

.avue-form-box .avue-form .el-form-item__label {
  font-weight: bold;
  /* width: 100% !important; */
  width: auto !important;
}
</style>
