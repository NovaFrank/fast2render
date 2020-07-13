<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :width="dialogWidth"
      :close-on-click-modal="false"
      :visible.sync="fieldDialogVisible"
      :before-close="closeDialog"
    >
      <avue-form ref="formField" :option="dialogOption" v-model="form" class="new-field">
        <template slot="materialNumber">
          <el-input v-model="form.materialNumber" :disabled="purchaseRequest">
            <i
              slot="suffix"
              class="el-input_icon el-icon-search pointer"
              @click="openFieldDialog"
            ></i>
          </el-input>
        </template>
        <template slot="ladderPriceJson">
          <div>
            <div v-if="form.quoteMethod === '1'">
              <avue-form
                ref="ladderForm"
                @submit="submitLadderForm"
                :option="ladderFormOption.option"
                v-model="ladderFormOption.form"
              ></avue-form>
              <avue-crud
                :data="ladderOption.data"
                :option="ladderOption.option"
                @row-del="delLadderUpdate"
              >
              </avue-crud>
            </div>
            <!-- 成本询价 -->
            <div v-else-if="form.quoteMethod === '2'">
              <el-select
                v-model="currentTemplate"
                @change="handleTemplateChange"
                filterable
                clearable
                placeholder="请选择 成本模板"
              >
                <el-option
                  v-for="item in templateList"
                  :key="item.templateName"
                  :label="item.templateName"
                  :value="item.templateName"
                >
                </el-option>
              </el-select>
              <!-- :tabView="false" -->
              <fast2-config-tab-render
                :tabPermission="tabPermission"
                :readOnly="true"
                :list="template"
                :providerData="data"
              ></fast2-config-tab-render>
            </div>
          </div>
        </template>
        <template slot="suppliers">
          <avue-crud
            :data="form.suppliers"
            :option="supplierList.option"
            @row-save="handleSaveSupplier"
            @row-del="handleDeleteSupplier"
          >
            <template slot="menuLeft">
              <el-button type="primary" @click="handleShowSupplierSelect">添加</el-button>
            </template>
          </avue-crud>
        </template>
        <template slot="menuForm">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </template>
      </avue-form>
    </el-dialog>

    <!-- 物料明细弹窗 -->
    <SelectDialogTable
      ref="materialsDialog"
      :dialogVisible.sync="materialDlgViaible"
      :title="'物料列表'"
      :column="materialsDialogOption.option.column"
      :data="materialsDialogOption.data"
      :page="materialsDialogOption.page"
      :queryParam="materialsDialogQueryParam"
      :pageParam="materialsDialogPageParam"
      :multiple="materialsDialogOption.option.multiple"
      @handleList="materialsHandleList"
      @ok="selectedMaterails"
    ></SelectDialogTable>
  </div>
</template>

<script>
import ladderFormOption from '@/const/rfq/newAndView/ladderForm';
import ladderOption from '@/const/rfq/newAndView/ladder';
import supplierList from '@/const/rfq/newAndView/supplierList';
import { costTemplateList } from '@/api/rfq/index';
import { getUserInfo } from '@/util/utils.js';
import { validateNull } from '../../../fast2render/lib/validate';
import SelectDialogTable from '@/components/views/SelectDialogTable';
import { materialListAction } from '@/api/rfq/common';
import materialsDialogOption from '@/const/rfq/newAndView/materialsDialog';

// 采购方添加询价明细
export default {
  name: 'field-dialog',
  components: { SelectDialogTable },
  created() {
    this.$getTemplateItem('cost-base-price-template').then((res) => {
      this.template = res.column[0].data;
    });
    this.costTemplateList();
  },
  props: {
    elsAccount: String,
    dialogWidth: String,
    dialogTitle: String,
    dialogOption: Object,
    fieldDialogType: String,
    purchaseRequest: {
      type: Boolean,
      default: false
    },
    fieldDialogVisible: {
      type: Boolean,
      default: false
    },
    field: {
      type: Object,
      default: () => {
        return {
          elsAccount: '',
          fromBusiness: '',
          ladderPriceJson: [],
          suppliers: []
        };
      }
    }
  },
  data() {
    return {
      materialsDialogOption: materialsDialogOption,
      materialsDialogQueryParam: {},
      materialsDialogPageParam: { pageNo: 1, pageSize: 10 },
      materialDlgViaible: false,
      currentTemplate: '',
      templateList: [],
      template: [],
      tabPermission: [],
      supplierList: supplierList,
      ladderOption: ladderOption,
      ladderFormOption: ladderFormOption,
      form: {
        ladderPriceJson: [],
        suppliers: []
      }
    };
  },
  watch: {
    field(newVal) {
      this.form = newVal;
      this.ladderOption.data = newVal.ladderPriceJson ? JSON.parse(newVal.ladderPriceJson) : [];
      if (this.form.quoteMethod === '2' && this.dialogTitle === '修改询价明细') {
        const costJson = JSON.parse(newVal.costConstituteJson);
        this.currentTemplate = costJson.templateName;
        // this.template = costJson.templateJson;
        this.tabPermission = costJson.permissionJson;
      }
    },
    'form.taxCode'(newVal) {
      this.form.taxRate = newVal ? newVal.split('_')[0] : '';
    }
  },
  methods: {
    checkAddedMaterials(list) {
      const data = this.materialListOption.data;

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
    selectedMaterails(materialList) {
      if (materialList.length > 0) {
        this.form.materialNumber = materialList[0].materialNumber;
        this.form.materialDesc = materialList[0].materialDesc;
        this.form.materialName = materialList[0].materialName;
        this.form.materialSpecifications = materialList[0].materialSpecifications;
        this.form.baseUnit = materialList[0].baseUnit;
        this.form.queryUuid = materialList[0].uuid;
      } else {
        this.$message.warning('请选择一条物料明细');
      }
    },
    materialsHandleList(queryCondition = {}, pagination) {
      const params = {
        auditStatus: 0,
        elsAccount: this.elsAccount,
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage,
        isFreeze: 'N',
        deleteIndicator: 'N'
      };

      for (const key in queryCondition) {
        if (queryCondition[key]) {
          params[key] = queryCondition[key];
        }
      }

      // 物料列表
      materialListAction(params).then((res) => {
        if (res.data.statusCode === '200') {
          const pageData = res.data.pageData;
          this.materialsDialogOption.data = pageData.rows || [];
          this.materialsDialogOption.page.total = pageData.total;
        } else {
          this.$message.error('查询采物料数据失败, ' + res.data.message || '');
        }
      });
    },
    openFieldDialog() {
      if (this.purchaseRequest) return;
      this.materialDlgViaible = true;
    },
    handleTemplateChange(value) {
      const index = this.templateList.findIndex((item) => item.templateName === value);
      if (index === -1) this.tabPermission = {};
      else this.tabPermission = JSON.parse(this.templateList[index].configJson);
    },
    costTemplateList() {
      const userInfo = getUserInfo();
      costTemplateList({
        elsAccount: userInfo.elsAccount,
        pageSize: 1000,
        businessModule: 'cost',
        currentVersionFlag: 'Y'
      }).then((res) => {
        this.templateList = res.data.pageData.rows;
      });
    },
    closeDialog() {
      this.$emit('close-field-dialog');
    },
    delLadderUpdate(row, index) {
      this.ladderOption.data.splice(index, 1);
      this.updateLadder();
    },
    handleDeleteSupplier(row, index) {
      this.form.suppliers.splice(index, 1);
    },
    handleSaveSupplier(row, done) {
      this.form.suppliers.push(row);
      done();
    },
    handleShowSupplierSelect() {
      this.$emit('show-supplier-select');
    },
    handleSubmit() {
      if (this.form.quoteMethod === '1') {
        if (this.ladderOption.data.length === 0) {
          this.$message.error('请添加阶梯数量');
          return;
        }
        this.form.ladderPriceJson = this.ladderOption.data;
      } else if (this.form.quoteMethod === '2') {
        if (validateNull(this.currentTemplate)) {
          this.$message.error('请选择成本模板');
          return;
        }
        const obj = {
          templateName: this.currentTemplate,
          templateJson: this.template,
          permissionJson: this.tabPermission
        };
        const costConstituteJson = JSON.stringify(obj);
        this.form.costConstituteJson = costConstituteJson;
      }
      this.$refs.formField.validate((valid) => {
        if (valid) {
          this.$emit('on-save-form', this.form);
        }
      });
    },
    submitLadderForm(form, done) {
      const length = this.ladderOption.data.length;
      if (
        this.ladderOption.data.length >= 1 &&
        Number.parseInt(form.ladderQuantity) <
          Number.parseInt(this.ladderOption.data[length - 1].ladderQuantity)
      ) {
        this.$message.error('阶梯数量必须大于上一阶梯数量');
        done();
        return;
      }
      this.ladderOption.data.push(form);
      this.updateLadder();
      this.ladderFormOption.form.ladderQuantity = '';
      done();
    },
    updateLadder() {
      const length = this.ladderOption.data.length;
      this.ladderOption.data = this.ladderOption.data.map((item, index) => {
        if (index === length - 1) {
          return {
            ...item,
            ladderGrade: `${item.ladderQuantity} <= x`
          };
        } else {
          return {
            ...item,
            ladderGrade: `${item.ladderQuantity} <= x < ${
              this.ladderOption.data[index + 1].ladderQuantity
            }`
          };
        }
      });
    }
  }
};
</script>
