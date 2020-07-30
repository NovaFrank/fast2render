<template>
  <div class="row-list">
    <el-button
      v-if="!readOnly && addBtn"
      size="small"
      style="margin-left: 10px; margin-bottom: 10px;"
      @click.stop="handleAddRow()"
      >添加行</el-button
    >
    <avue-crud
      ref="crud"
      v-if="reload"
      :data="data"
      :option.sync="finalOption"
      v-model="obj"
      v-on="$listeners"
      @row-del="rowDelete"
      @row-update="rowUpdate"
    >
      <template v-for="item in itemLinkList" :slot="item.prop" slot-scope="scope">
        <el-tag v-if="readOnly" :key="item.prop" @click.stop="go(item, scope.row)">
          {{ scope.row[item.prop] }}</el-tag
        >
        <component
          v-else
          :key="item.prop"
          :is="item.component"
          :seleted.sync="scope.row[item.prop]"
          @selectDone="doSelect(item.func, scope.row, $event, item.params)"
        ></component>
      </template>
    </avue-crud>
  </div>
</template>
<script>
import { getApiPath } from '../../../lib/utils.js';
import { validateNull } from '../../../lib/validate';
import { format, chain, bignumber } from 'mathjs';

const baseUrl = getApiPath();

export default {
  name: 'RowProvider',
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
          }
        ];
      }
    },
    addInCell: {
      type: Boolean,
      default: true // 远程获取 表格字段数据配置- 后续扩充 from 类型
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
    option: {
      type: Object,
      default: function() {
        return { column: [] };
      }
    },
    data: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  created() {
    this.reload = true;
  },
  data() {
    return {
      finalOption: {},
      reload: false,
      optionHash: '',
      obj: {},
      existsMaterials: []
    };
  },
  watch: {
    option: {
      handler(n) {
        if (n) {
          this.finalOption = JSON.parse(JSON.stringify(n));
          this.filterColum(this.finalOption);
          this.finalOption.editBtn = false;
          this.finalOption.cellBtn = true;
        }
      },
      immediate: true, // 刷新加载 立马触发一次handler
      deep: true
    }
    // 单点监测 ，避免多次触发
  },
  methods: {
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
    rowDelete(row, index) {
      this.data.splice(index, 1);
    },
    handleAddRow(title, row) {
      console.log('配置属性', this.$refs.crud.option.column);
      this.$emit('handleAddShow');
    },
    saveSelected(row, list, params) {
      const item = list[0];
      row[params[0]] = item[params[2]];
      row[params[1]] = item[params[3]];
    },
    addEmptyRow() {
      const item = {};
      const showColumnProps = this.getShowColumnProps();

      for (const prop in showColumnProps) {
        // for (const prop in this.existColumnProps) {
        item[prop] = '';
      }
      this.data.push(item);
    },
    addEmptyMaterail() {
      const item = {};
      const showColumnProps = this.getShowColumnProps();

      for (const prop in showColumnProps) {
        // for (const prop in this.existColumnProps) {
        item[prop] = '';
      }
      this.data.push(item);
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

    rowUpdate(row, index, done, loading) {
      const data = this.data[index];

      if (row.queryUuid) {
        data.queryUuid = row.queryUuid;
      }
      Object.assign(data, row);
      const subtotalAmount = format(
        chain(bignumber(data.budgetPrice))
          .multiply(bignumber(data.quantity))
          .done()
      );
      data.subtotalAmount = subtotalAmount || 0;
      done();
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
    selectedRowMaterails(row, materialList) {
      if (materialList.length > 0) {
        const result = this.checkAddedMaterials(materialList);
        const refs = this.getSelectRefs('materialNumber');
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
    checkDataType(originItem, item, waitUpdateDic) {
      if (!originItem || originItem === -1) {
        return false;
      }
      item = {
        ...originItem,
        ...item
      };
      switch (originItem.datatype) {
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
        case 'datatime':
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
      if ((originItem.datatype = 'popup' && !originItem.ref)) {
        item.formslot = true;
        item.slot = true;
      }
      if (originItem.ref) {
        item.disabled = 'disabled';
      }
      if (!validateNull(item.bizDic)) {
        delete item.dicData;
        delete item.dicMethod;
        delete item.props;
        item.type = 'select';
        item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
        waitUpdateDic.push(item.prop);
      }
    },
    initSlotList(option) {
      const list = option?.column;
      this.itemLinkList.map((item) => {
        const linkItem = this.findObject(list, item.prop);
        if (linkItem !== -1) {
          linkItem.slot = true;
        }
      });
      return option;
    },
    filterColum(option) {
      // 新增时, 不需要 申请单号
      const tablePermission = this.rowPermission;
      delete tablePermission.purchaseRequestNumber;

      // 行号由应用控制，不允许编辑
      if (tablePermission.requestItemNumber) {
        tablePermission.requestItemNumber.readonly = true;
      }

      // 状态由应用控制，不允许编辑
      if (tablePermission.itemStatus) {
        tablePermission.itemStatus.readonly = true;
      }
      const waitUpdateDic = [];
      const crud = this.$refs.crud;
      option.column.map((item) => {
        const itemProp = this.rowPermission[item.prop];

        const originItem = this.findObject(this.originColumn, item.prop);
        this.checkDataType(originItem, item, waitUpdateDic);
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
              item.type = 'select';
              item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${itemProp.bizDic}`;
              waitUpdateDic.push(item.prop);
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
            item.display = true;
          }
        }
      });
      waitUpdateDic.map((prop) => {
        if (crud && prop) {
          crud.updateDic(prop);
        }
      });
      return this.initSlotList(option);
    }
  }
};
</script>
<style>
.row-list .avue-crud__menu {
  display: none;
}
</style>
