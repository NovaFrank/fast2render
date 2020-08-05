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
          :api="listApi[item.prop]"
          :list-params="listParams[item.prop]"
          :seleted.sync="data.data[item.prop]"
          @selectDone="doSelect(item.func, data.data, $event, item.params)"
        />
      </template>
      <template v-for="item in itemUploadList" :slot="item.prop">
        <span :key="item.prop">
          <span v-if="data.data[item.prop]">
            <img v-if="item.datatype === 'uploadImg'" width="200px" :src="data.data[item.prop]" />
            <el-link v-else :href="data.data[item.prop]">
              下载
            </el-link>
          </span>
          <fast2-upload
            v-if="!readOnly"
            @file-success="fileSuccess"
            @file-progress="onFileProgress"
            @file-error="onFileError"
            @click="setUploadField(item.prop)"
        /></span>
      </template>
    </avue-form>
  </div>
</template>
<script>
import { getApiPath, getObjType } from '../../../lib/utils.js';
import { getFilePath, checkDataType } from '../core/utils.js';
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
    itemUploadList: {
      type: Array,
      default: function() {
        return [];
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
      obj: this.data.data || {},
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
    'data.data': {
      handler: function(newVal, oldVar) {
        this.$emit('on-update', newVal);
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
    fileSuccess(req, req1, res) {
      const data = JSON.parse(res).data;
      const prop = this.uploadField || this.itemUploadList[0].prop;
      if (prop) {
        this.data.data[prop] = getFilePath() + data.url;
      }
    },
    onFileProgress() {
      console.log('上传中');
    },
    setUploadField(prop) {
      this.uploadField = prop;
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
      const field = params[0] || 'materialNumber';
      this.$emit('on-select', field, row);
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

    checkSlot(item) {
      this.itemLinkList.map((linkItem) => {
        if (item.prop === linkItem.prop) {
          item.formslot = true;
          item.slot = true;
        }
      });
      if (item.datatype === 'uploadImg' || item.prop === 'picture') {
        this.itemUploadList.push(item);
      }
      if (item.datatype === 'uploadFile' || item.prop === 'url') {
        item.datatype = 'uploadFile';
        item.slot = true;
        this.itemUploadList.push(item);
      }
      this.itemUploadList.map((linkItem) => {
        if (item.prop === linkItem.prop) {
          item.formslot = true;
          item.slot = true;
        }
      });
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
        checkDataType(item);
        this.checkSlot(item);
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
</style>