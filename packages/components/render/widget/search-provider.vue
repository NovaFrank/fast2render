<template>
  <div class="search-list">
    <avue-form
      v-if="data.data && inited"
      ref="searchForm"
      v-model="data.data"
      :option.sync="finalOption"
      v-on="$listeners"
    >
      <template v-for="item in itemLinkList" :slot="item.prop">
        <component
          :is="item.component"
          :key="item.prop"
          :api="listApi[item.prop]"
          :list-params="listParams[item.prop]"
          :seleted.sync="data.data[item.prop]"
          @selectDone="doSelect(item.func, data.data, $event, item.params)"
        />
      </template>
      <template slot="menuForm" style="text-align: center;">
        <div style="text-align: center;">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-delete" @click="handleSearchReset">清 空</el-button>
        </div>
      </template>
    </avue-form>
  </div>
</template>
<script>
import { getApiPath, getObjType } from '../../../lib/utils.js';
import { checkDataType } from '../core/utils.js';
import { validateNull } from '../../../lib/validate';
import { getUserInfo } from '../../../lib/auth';
import { ElsPageConfigService } from '../../../lib/api/materials';
import popList from '../../../lib/popList';
import materialsFix from '../../../lib/materials-fix';

const baseUrl = getApiPath();

export default {
  name: 'SearchProvider',
  props: {
    pageCode: {
      type: String,
      default: '' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    status: {
      type: String,
      default: 'new' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    listParams: {
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
        return { submitBtn: true, submitBtnText: '搜索', column: [] };
      }
    },
    data: {
      type: Object,
      default: function() {
        return {};
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
      obj: this.data || {},
      reload: false,
      formSlots: [],
      optionHash: '',
      typeData: [],
      seleted: {},
      configurations: {},
      uploadField: ''
    };
  },
  watch: {
    // 暂时无需监测
    obj: {
      handler: function(newVal, oldVar) {
        this.$emit('on-update', newVal);
      },
      immediate: true,
      deep: true
    }
  },
  async created() {
    this.loadConfigruations();
  },
  methods: {
    saveSelected(row, list, params) {
      const item = list[0];
      row[params[0]] = item[params[2]];
      item[params[0]] = item[params[2]];
      row[params[1]] = item[params[3]];
      item[params[1]] = item[params[3]];
    },
    getData() {
      return this.obj;
    },
    initData(val) {
      this.obj = val;
    },
    updateSearchParmas(field, parmas) {
      // 更新 弹窗过滤条件
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
    handleSearch() {
      this.$emit('do-search', this.obj);
    },
    handleSearchReset() {
      this.$refs.searchForm.resetForm();
      this.stepActive = 5;
      this.tabOption.column = [];
      this.isSetTabOption = false;

      setTimeout(() => {
        this.stepActive = 5;
        this.tabOption.column = [];
        this.isSetTabOption = false;
      }, 100);

      this.queryCondition = {};
      this.searchCondition = {};
      this.$emit('do-action', 'storeQueryState');
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
      const form = this.$refs.searchForm;
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

    doSelect(func, row, event, params = []) {
      const type = getObjType(this[func]);
      if (type === 'function') {
        this[func](row, event, params);
      }
      const field = params[0] || 'materialNumber';
      this.$emit('on-select', field, row);
    },

    loadConfigruations() {
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
            const serachColumn = [];
            //TODO 添加权限过滤条件
            field.map((item) => {
              if (item.isSearch) {
                serachColumn.push(item);
              }
            });
            table.map((item) => {
              if (item.isSearch) {
                serachColumn.push(item);
              }
            });

            this.finalOption.column = serachColumn;

            const configurations = {
              listColumns: field
            };
            this.configurations = configurations;
          } else {
            console.log('query purchase rquestion cofiguration fail', res.data);
            this.$message.error('查找单据类型数据失败, ' + res.data.message || '');
          }
          // 默认加载
          this.setTableColumns();
        })
        .catch((err) => {
          console.log('query purchase rquestion cofiguration error', err);
          this.$message.error('查找单据类型配置数据失败, ' + err.message || '');
        });
    },
    setTableColumns(val) {
      const selected = this.configurations;
      this.$emit('updateTableColumn', selected);
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
    filterColum(column) {
      column.map((item) => {
        delete item.readonly;
        let label = item.label;
        if (item.displayName) {
          item.label = item.displayName;
          label = item.displayName;
        }
        checkDataType(item);
        if (!validateNull(item.bizDic)) {
          delete item.dicData;
          delete item.dicMethod;
          delete item.props;
          item.type = item.type || 'select';
          item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
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
.search-list .el-form-item__label {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  width: auto !important;
}
.search-list .el-form-item__content {
  position: relative;
  display: block;
  flex: 1;
  width: auto;
  margin-left: 0 !important;
}
.search-list .el-form-item {
  display: flex;
}
</style>
