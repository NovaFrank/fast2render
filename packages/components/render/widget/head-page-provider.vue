<template>
  <div class="head-list">
    <avue-form
      v-if="data.data && inited"
      ref="form"
      v-model="data.data"
      :option.sync="finalOption"
      v-on="$listeners"
    >
      <template v-for="item in itemLinkList" :slot="item.prop">
        <el-tag
          v-if="readOnly && data.data[item.prop]"
          :key="item.prop"
          @click.stop="go(item, data.data)"
        >
          {{ data.data[item.prop] }}
        </el-tag>
        <component
          :is="item.component"
          v-else
          :key="item.prop"
          :seleted.sync="data.data[item.prop]"
          @selectDone="doSelect(item.func, data.data, $event, item.params)"
        />
      </template>
    </avue-form>
  </div>
</template>
<script>
import { getApiPath, getObjType } from '../../../lib/utils.js';
import { validateNull } from '../../../lib/validate';
import { getUserInfo } from '../../../lib/auth';
import { ElsPageConfigService } from '../../../lib/api/materials';
import popList from '../../../lib/popList';
import materialsFix from '../../../lib/materials-fix';

const baseUrl = getApiPath();

export default {
  name: 'HeadPageProvider',
  props: {
    pageCode: {
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
    itemLinkList: {
      type: Array,
      default: function() {
        return popList;
      }
    },
    extendDic: {
      type: Array,
      default: function() {
        return [];
      }
    },
    propMatch: {
      type: Array,
      default: function() {
        return [
          {
            from: 'subElsAccount',
            to: 'purchasePlaner',
            ref: 'purchasePlaner'
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
        return { data: {} };
      }
    }
  },
  data() {
    return {
      finalOption: {
        menuBtn: false,
        submitBtn: false,
        clearBtn: false,
        column: []
      },
      inited: false,
      form: this.data.data,
      reload: false,
      formSlots: [],
      optionHash: '',
      typeData: [],
      seleted: {},
      configurations: {}
    };
  },
  watch: {
    // 暂时无需监测
    form: {
      handler: function(newVal, oldVar) {
        this.emit('on-update', newVal);
      },
      immediate: true,
      deep: true
    }
  },
  async created() {
    if (this.readOnly) {
      this.finalOption.detail = true;
    }
    this.loadConfigruations();
  },
  methods: {
    saveSelected(row, list, params) {
      const item = list[0];
      const ref = params[0];
      const refs = this.getSelectRefs(ref);
      const propMacth = this.propMatch;
      row[params[0]] = item[params[2]];
      item[params[0]] = item[params[2]];
      row[params[1]] = item[params[3]];
      item[params[1]] = item[params[3]];
      //
      if (refs && refs.length) {
        refs.map((prop) => {
          if (item[prop]) {
            row[prop] = item[prop];
          }
        });
      }
      if (propMacth && propMacth.length) {
        propMacth.map((matchitem) => {
          if (matchitem.ref === ref) {
            row[matchitem.to] = item[matchitem.from];
          }
        });
      }
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
      const selected = this.configurations;
      if (selected) {
        this.seleted = selected;
        this.updateCoumn(selected);
      }
    },

    getData() {
      return this.data.data;
    },

    updateCoumn(selected) {
      const column = this.finalOption.column;
      column.length = 0;
      const newColumn = this.filterColum(selected.fieldColumns);

      const waitUpdateDic = [];
      newColumn.map((item) => {
        this.replaceWithExtendDic(item);
        column.push(item);
        if (item.dicUrl) {
          waitUpdateDic.push(item.prop);
        }
      });
      this.updateDic(waitUpdateDic);
      this.inited = true;
    },

    replaceWithExtendDic(item) {
      const extendlist = this.extendDic;
      if (extendlist.length) {
        extendlist.map((ditem) => {
          if (item.prop === ditem.prop) {
            Object.assign(item, ditem);
            delete item.dicUrl;
            delete item.bizDic;
            delete item.datatype;
          }
        });
      }
    },

    updateDic(list) {
      const form = this.$refs.form;
      if (form) {
        list.map((prop) => {
          form.updateDic(prop);
        });
      } else {
        setTimeout(() => {
          this.updateDic(list);
        }, 1000);
      }
    },

    setTableColumns(val) {
      const selected = this.configurations;
      this.$emit('updateTableColumn', selected);
    },

    doSelect(func, row, event, params = []) {
      const type = getObjType(this[func]);
      if (type === 'function') {
        this[func](row, event, params);
      }
      this.$forceUpdate();
    },

    loadConfigruations() {
      const fieldPermission = {};
      const tablePermission = {};
      ElsPageConfigService.list({
        elsAccount: getUserInfo().elsAccount,
        code: this.pageCode
      })
        .then((res) => {
          if (
            res.data &&
            res.data.statusCode === '200' &&
            res.data.message === 'response OK' &&
            res.data.data
          ) {
            const item = res.data.data || {};

            const configJson = item.outputJson || [];

            const json = JSON.parse(configJson);

            const field = json.field;

            const table = json.table;

            const configurations = {
              fieldColumns: field,
              fieldJson: fieldPermission,
              tableColumns: table,
              tableJson: tablePermission
            };
            this.configurations = configurations;
          } else {
            console.log('query purchase rquestion cofiguration fail', res.data);
            this.$message.error('查找单据类型数据失败, ' + res.data.message || '');
          }

          if (this.readOnly) {
            console.log('view');
          }
          // 默认加载
          this.setHeadColumns();
          this.setTableColumns();
        })
        .catch((err) => {
          console.log('query purchase rquestion cofiguration error', err);
          this.$message.error('查找单据类型配置数据失败, ' + err.message || '');
        });
    },

    getSelectRefs(type) {
      const refs = [];
      if (!type) {
        return refs;
      }
      debugger;
      this.finalOption.column.map((item) => {
        if (item.ref && item.ref.includes(type)) {
          refs.push(item.prop);
        }
      });
      console.log('赋值列表', refs);
      return refs;
    },

    getMaterialsRefs() {
      const refs = [];
      materialsFix.map((item) => {
        if (item.ref) {
          refs.push(item.prop);
        }
      });
      console.log('物料赋值列表', refs);
      return refs;
    },

    checkDataType(item) {
      const dateList = ['noteDate', 'deliveryDate', 'confirmDate', 'needDate'];
      const datetimeList = ['createDate', 'lastUpdateDate', 'validUntilTime'];

      if (dateList.includes(item.prop)) {
        item.datatype = 'date';
      }
      if (datetimeList.includes(item.prop)) {
        item.datatype = 'datetime';
      }

      switch (item.datatype) {
        case 'popup':
          item.formslot = true;
          item.slot = true;
          break;
        case 'popupName':
          item.disabled = 'disabled';
          break;
        case 'data':
        case 'date':
          item.type = 'date';
          item.format = 'yyyy-MM-dd';
          item.valueFormat = 'timestamp';
          break;
        case 'datatime':
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
      this.itemLinkList.map((linkItem) => {
        if (item.prop === linkItem.prop) {
          item.formslot = true;
          item.slot = true;
        }
      });

      if (!validateNull(item.bizDic)) {
        delete item.dicMethod;
        delete item.props;
        item.type = 'select';
        item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
      }
      this.$forceUpdate();
    },

    selectedRowMaterails(row, materialList) {
      const refs = this.getMaterialsRefs();
      const material = materialList[0];
      refs.map((prop) => {
        row[prop] = material[prop] || '';
      });
      console.log('重新赋值', row, material);
      // 创建. 修改采购申请(新增的行将物料的uuid放入queryUuid字段), 重新选择了物料也要更新 queryUuid
      row.queryUuid = material.uuid;
      row.materialNumber = material.materialNumber;
      const materialObject = row;
      Object.assign(materialObject, material);
    },

    filterColum(column) {
      column.map((item) => {
        delete item.readonly;
        let label = item.label;
        if (item.displayName) {
          item.label = item.displayName;
          label = item.displayName;
        }
        this.checkDataType(item);
        const isRequired = item.isRequired === 'Y';
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
        if (!validateNull(item.bizDic)) {
          delete item.dicData;
          delete item.dicMethod;
          delete item.props;
          item.type = item.type || 'select';
          item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
        }
        if (item.isDisabled || item.ref) {
          item.disabled = 'disabled';
          item.rules = [];
        }
        if (item.isReadOnly === 'Y') {
          item.disabled = 'disabled';
          item.readonly = 'readonly';
        }
        if (item.isReadOnly === 'Y' && item.isUserInput === 'Y') {
          item.type = 'text';
        }

        item.display = true;
        item.span = 6;
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
