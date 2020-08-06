<template>
  <div class="row-list">
    <el-button
      v-if="!readOnly && addBtn"
      size="small"
      style="margin-left: 10px; margin-bottom: 10px;"
      @click.stop="handleAddRow()"
    >
      添加行
    </el-button>
    <avue-crud
      v-if="reload"
      ref="crud"
      v-model="obj"
      :data="data"
      :option.sync="finalOption"
      :page.sync="page"
      v-on="$listeners"
      @row-del="rowDelete"
      @row-update="rowUpdate"
    >
      <template v-for="item in itemLinkList" :slot="item.prop" slot-scope="scope">
        <el-tag
          v-if="readOnly || !scope.row.$cellEdit"
          :key="item.prop"
          @click.stop="go(item, scope.row)"
        >
          {{ scope.row[item.prop] }}
        </el-tag>
        <component
          :is="item.component"
          v-else
          :key="item.prop"
          :api="listApi[item.prop]"
          :list-params.sync="listParams[item.prop]"
          :seleted.sync="scope.row[item.prop]"
          @selectDone="doSelect(item.func, scope.row, $event, item.params)"
        />
      </template>
      <template v-for="item in itemUploadList" :slot="item.prop" slot-scope="scope">
        <span :key="item.prop">
          <span v-if="data.data[item.prop]">
            <img
              v-if="item.datatype === 'uploadImg'"
              width="40px"
              class="rowImage"
              :src="data.data[item.prop]"
            />
            <el-link v-else :href="data.data[item.prop]">
              下载
            </el-link>
          </span>
          <fast2-upload
            v-if="!readOnly && !!scope.row.$cellEdit"
            @file-success="fileSuccess"
            @file-progress="onFileProgress"
            @file-error="onFileError"
            @click="setUploadField(item.prop)"
        /></span>
      </template>
    </avue-crud>
  </div>
</template>
<script>
import { getApiPath, generateRandomString } from '../../../lib/utils.js';
import { validateNull } from '../../../lib/validate';
import { format, chain, bignumber } from 'mathjs';
import popList from '../../../lib/popList';
import materialsFix from '../../../lib/materials-fix';

const baseUrl = getApiPath();

export default {
  name: 'RowPageProvider',
  props: {
    type: {
      type: String,
      default: 'crud' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    readOnly: {
      type: Boolean,
      default: false // 是否只读模式
    },
    addBtn: {
      type: Boolean,
      default: true // 是否显示添加按钮
    },
    itemLink: {
      type: Boolean,
      default: false // 是否只读模式
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
    itemUploadList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    option: {
      type: Object,
      default: function() {
        return { column: [] };
      }
    },
    page: {
      type: Object,
      default: function() {
        return {};
      }
    },
    data: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      finalOption: {},
      reload: false,
      optionHash: '',
      obj: {},
      existsMaterials: [],
      materialsColumn: []
    };
  },
  watch: {
    option: {
      handler(n) {
        if (n) {
          const finalOption = JSON.parse(JSON.stringify(n));
          this.finalOption = this.filterColum(finalOption);
          this.finalOption.editBtn = false;
          if (!this.readOnly) {
            this.finalOption.cellBtn = true;
          }
        }
      },
      immediate: true, // 刷新加载 立马触发一次handler
      deep: true
    }
    // 单点监测 ，避免多次触发
  },
  created() {
    this.reload = true;
    if (this.readOnly) {
      this.finalOption.menu = false;
    }
  },
  methods: {
    addEmptyRow() {
      const item = {};
      const showColumnProps = this.getShowColumnProps();

      for (const prop in showColumnProps) {
        // for (const prop in this.existColumnProps) {
        item[prop] = '';
        item.id = `${new Date().valueOf()}${generateRandomString(6)}`;
      }

      this.data.push(item);
    },

    beforeAddRow() {
      console.log('Add Row Before');
    },

    checkAddedMaterials(list) {
      const data = this.data;

      const addMaterialList = [];
      const existsList = [];

      if (data.length < 1) {
        return {
          addList: list,
          existsList
        };
      } else {
        const materialNumberList = [];

        data.map((item) => {
          item.materialNumber && materialNumberList.push(item.materialNumber);
        });

        for (const item of list) {
          if (item.materialNumber && materialNumberList.includes(item.materialNumber)) {
            existsList.push({
              materialNumber: item.materialNumber,
              name: item.materialDesc || item.materialName || ''
            });
          } else {
            addMaterialList.push(item);
          }
        }
      }

      return {
        addList: addMaterialList,
        existsList
      };
    },
    // slot 弹框 处理
    doSelect(func, row, event, params = []) {
      this[func](row, event, params);
      this.$forceUpdate();
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

    handleAddRow(title, row) {
      console.log('配置属性', this.$refs.crud.option.column);
      this.$emit('before-add', row);
      this.$emit('handleAddShow');
    },

    checkDataType(item, waitUpdateDic) {
      switch (item.datatype) {
        case 'popup':
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
      if (item.ref) {
        item.disabled = 'disabled';
      }
    },

    checkForm(callback, failback) {
      callback && callback();
      // this.$refs.form.validate((valid) => {
      //   if (valid) {
      //     callback && callback();
      //   } else {
      //     failback && failback();
      //     return false;
      //   }
      // });
    },

    filterColum(option) {
      // 新增时, 不需要 申请单号
      const waitUpdateDic = [];
      const crud = this.$refs.crud;
      if (!option || !option.column) {
        return false;
      }
      option.column.map((item) => {
        this.checkDataType(item, waitUpdateDic);
        this.checkSlot(item);
        let label = item.label;
        if (item.displayName) {
          item.label = item.displayName;
          label = item.displayName;
        }
        const isRequired = !!item.isRequired;
        if (isRequired) {
          // 日期格式校验不通过。 暂时隐藏
          const rule = {
            required: true,
            message: '请输入' + label,
            trigger: 'blur'
          };
          if (item.datatype === 'date' || item.datatype === 'datetime' || item.type === 'number') {
            rule.type = 'number';
          }

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
          item.type = 'select';
          item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
          waitUpdateDic.push(item.prop);
        }
        if (
          item.isDisabled === 'Y' ||
          item.isReadOnly === 'Y' ||
          this.readOnly ||
          item.ref ||
          item.disabled === 'disabled'
        ) {
          item.disabled = 'disabled';
          item.cell = false;
          item.rules = [];
        } else {
          item.cell = true;
        }
        item.display = true;
      });
      waitUpdateDic.map((prop) => {
        if (crud && prop) {
          crud.updateDic(prop);
        }
      });
      return option;
    },

    getSelectRefs(type) {
      const refs = [];
      this.finalOption.column.map((item) => {
        if (item.datatype !== 'popup' && item.isSystem !== 'Y') {
          refs.push(item.prop);
        }
      });
      console.log('赋值列表', refs);
      return refs;
    },

    getShowColumnProps() {
      const showColumnProps = this.showColumnProps || {};

      if (!this.showColumnProps) {
        const columns = this.$refs.crud.option.column;

        columns.forEach((item) => {
          showColumnProps[item.prop] = 1;
        });

        this.showColumnProps = showColumnProps;
      }

      return this.showColumnProps;
    },

    rowDelete(row, index) {
      this.data.splice(index, 1);
    },

    rowUpdate(row, index, done, loading) {
      const data = this.data[index];

      if (row.queryUuid) {
        data.queryUuid = row.queryUuid;
      }
      Object.assign(data, row);

      if (typeof data.budgetPrice !== 'undefined' && typeof data.quantity !== 'undefined') {
        // 采购申请有这个数据
        const subtotalAmount = format(
          chain(bignumber(data.budgetPrice))
            .multiply(bignumber(data.quantity))
            .done()
        );
        data.subtotalAmount = subtotalAmount;
      }
      done();
    },

    saveSelected(row, list, params) {
      const item = list[0];
      if (params) {
        row[params[0]] = item[params[2]];
        row[params[1]] = item[params[3]];
      }
      const refs = this.getSelectRefs();
      refs.map((prop) => {
        const isItem = !!item[prop];
        if (isItem) {
          row[prop] = item[prop];
        }
      });
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
      if (materialList && materialList.length > 0) {
        const result = this.checkAddedMaterials(materialList);
        const refs = this.getMaterialsRefs();
        const addMaterialList = result.addList;

        for (const material of addMaterialList) {
          refs.map((prop) => {
            row[prop] = material[prop] || '';
          });
          console.log('重新赋值', row, material);
          // 创建. 修改采购申请(新增的行将物料的uuid放入queryUuid字段), 重新选择了物料也要更新 queryUuid
          row.queryUuid = material.uuid;
          row.materialNumber = material.materialNumber;
          const materialObject = row;

          Object.assign(materialObject, material);
          // 设置与物料编辑关联的表单编辑状态
          //  this.disableOpenForms(item.materialNumber);
        }

        if (result.existsList.length > 0) {
          this.existsMaterials.data = result.existsList;

          this.existsMaterials.visible = true;
        }
      } else {
        this.$message.warning('请选择一条物料明细');
      }
    }
  }
};
</script>
<style>
.row-list .avue-crud__menu {
  display: none;
}
</style>
