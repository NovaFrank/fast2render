<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="dialogOption" v-model="form" class="new-field">
      <template slot="ladderPriceJson">
        <div>
          <div v-if="form.quoteMethod === '1'">
            <avue-form
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
            <el-select v-model="currentTemplate" filterable clearable placeholder="请选择 成本模板">
              <el-option
                v-for="item in templateList"
                :key="item.templateName"
                :label="item.templateName"
                :value="item.templateName"
              >
              </el-option>
            </el-select>
            <fast2-cost-config-tab-render
              :list="template"
              :providerData="data"
            ></fast2-cost-config-tab-render>
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
</template>

<script>
import ladderFormOption from '@/const/rfq/newAndView/ladderForm';
import ladderOption from '@/const/rfq/newAndView/ladder';
import supplierList from '@/const/rfq/newAndView/supplierList';
import { costTemplateList } from '@/api/rfq/index';
import { getUserInfo } from '@/util/utils.js';

// 采购方添加询价明细
export default {
  name: 'field-dialog',
  components: {},
  created() {
    this.costTemplateList();
  },
  props: {
    dialogWidth: String,
    dialogTitle: String,
    dialogOption: Object,
    fieldDialogType: String,
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
      currentTemplate: '',
      templateList: [],
      template: [],
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
    currentTemplate(newVal) {
      // if (newVal) {
      //   const index = this.templateList.findIndex((item) => item.templateName === newVal);
      //   this.template = JSON.parse(this.templateList[index].configJson);
      // }
    },
    field(newVal) {
      this.form = newVal;
      this.ladderOption.data = newVal.ladderPriceJson ? JSON.parse(newVal.ladderPriceJson) : [];
      this.$getTemplateItem('cost-base-price-template').then((res) => {
        this.template = res.column[0].data;
      });
    },
    'form.taxCode'(newVal) {
      this.form.taxRate = newVal ? newVal.split('_')[0] : '';
    }
  },
  methods: {
    costTemplateList() {
      const userInfo = getUserInfo();
      costTemplateList({
        elsAccount: userInfo.elsAccount,
        pageSize: 1000,
        businessModule: 'cost'
      }).then((res) => {
        console.log(res);
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
        const obj = {
          templateName: this.currentTemplate,
          templateJson: this.template
        };
        console.log(obj);
        const costConstituteJson = JSON.stringify(obj);
        this.form.costConstituteJson = costConstituteJson;
      }
      this.$refs.form.validate((valid) => {
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
