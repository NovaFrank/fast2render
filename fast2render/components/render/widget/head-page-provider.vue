<template>
  <div class="head-list">
    <avue-form ref="form" :option.sync="finalOption" v-model="form" v-if="inited" v-on="$listeners">
      <template v-for="item in itemLinkList" :slot="item.prop">
        <el-tag v-if="readOnly" :key="item.prop" @click.stop="go(item, data)">
          {{ form[item.prop] }}</el-tag
        >
        <component
          v-else
          :key="item.prop"
          :is="item.component"
          :seleted.sync="form[item.prop]"
          @selectDone="doSelect(item.func, form, $event, item.params)"
        ></component>
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
      default: function () {
        return popList;
      }
    },
    option: {
      type: Object,
      default: function () {
        return { column: [] };
      }
    },
    data: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  async created() {
    if (this.readOnly) {
      this.finalOption.detail = true;
    }
    this.loadConfigruations();
  },
  watch: {
    // 暂时无需监测
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
      form: this.data,
      reload: false,
      formSlots: [],
      optionHash: '',
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
      const selected = this.configurations;
      if (selected) {
        this.seleted = selected;
        this.updateCoumn(selected);
      }
    },
    getData() {
      return this.form;
    },
    updateCoumn(selected) {
      const column = this.finalOption.column;
      const form = this.$refs?.form;
      column.length = 0;
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
      let fieldPermission = {};
      let tablePermission = {};
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
            const userStation = this.elsAccountStation || '';
            const configJson = item.outputJson || [];

            const json = JSON.parse(configJson);

            const field = json.field;
            const fieldJson = json.fieldJson || {};

            const table = json.table;
            const tableJson = json.tableJson || {};

            fieldPermission = fieldJson[userStation] || {};
            tablePermission = tableJson[userStation] || {};

            const configurations = {
              fieldColumns: field,
              fieldPermission: fieldPermission,
              tableColumns: table,
              tablePermission: tablePermission
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
        if (item.ref && item.ref.includes(type)) {
          refs.push(item.prop);
        }
      });
      console.log('赋值列表', refs);
      return refs;
    },
    checkDataType(item) {
      switch (item.datatype) {
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
      if (item.datatype === 'popup') {
        item.formslot = true;
      }
      if (item.ref) {
        item.disabled = 'disabled';
      }
      if (item.isSystem === 'Y' && this.status === 'new') {
        item.hide = true;
        item.rules = [];
      }
      this.itemLinkList.map((linkItem) => {
        if (item.prop === linkItem.prop) {
          item.formslot = true;
        }
      });
      if (!validateNull(item.bizDic)) {
        delete item.dicData;
        delete item.dicMethod;
        delete item.props;
        item.type = 'select';
        item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
      }
      this.$forceUpdate();
    },
    selectedRowMaterails(row, materialList) {
      const refs = this.getSelectRefs('materialNumber');
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
        this.checkDataType(item);
        let label = item.label;
        if (item.displayName) {
          item.label = item.displayName;
          label = item.displayName;
        }
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
        if (item.isDisabled || item.ref || item.disabled === 'disabled') {
          item.disabled = 'disabled';
          item.cell = false;
          item.rules = [];
        } else {
          item.cell = true;
        }
        if (this.readOnly === 'Y') {
          item.type = 'text';
        }
        item.display = true;
        item.span = 6;
        this.inited = true;
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
