<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="quoteFormOption.option" v-model="form" class="new-field">
      <template slot="ladderPriceJson">
        <avue-crud :data="ladderOption.data" :option="ladderOption.option">
          <template slot-scope="scope" slot="priceIncludingTax">
            <el-input
              placeholder="请输入 含税价"
              v-model="scope.row.priceIncludingTax"
              @blur="(event) => handleInputPrice(event, scope)"
            ></el-input>
          </template>
          <template slot-scope="scope" slot="taxRate">
            <el-input
              :disabled="enquiryPurchaserTax === true"
              placeholder="请输入 税率"
              v-model="scope.row.taxRate"
              @blur="(event) => handleInputRate(event, scope)"
            ></el-input>
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
import quoteFormOption from '@/const/rfq/supplierClient/ladderQuoteForm';
import ladderOption from '@/const/rfq/supplierClient/quoteList';
import { validatenull } from '@/util/validate';

const execMathExpress = require('exec-mathexpress');

// 销售方阶梯报价
export default {
  name: 'quote-ladder-dialog',
  components: {},
  created: function() {},
  props: {
    enquiryPurchaserTax: Boolean,
    dialogWidth: String,
    dialogTitle: String,
    fieldDialogType: String,
    fieldDialogVisible: {
      type: Boolean,
      default: false
    },
    field: {
      type: Object,
      default: () => {
        return {
          ladderPriceJson: []
        };
      }
    }
  },
  data() {
    return {
      quoteFormOption: quoteFormOption,
      ladderOption: ladderOption,
      form: {
        ladderPriceJson: [],
        remark: ''
      }
    };
  },
  watch: {
    field(newVal) {
      this.form = newVal;
      if (newVal.ladderPriceJson)
        this.ladderOption.data =
          JSON.parse(newVal.ladderPriceJson).map((item) => {
            return {
              ladderQuantity: item.ladderQuantity,
              ladderGrade: item.ladderGrade,
              priceIncludingTax: item.priceIncludingTax || '',
              taxRate: item.taxRate || newVal.taxRate,
              priceExcludingTax: item.priceExcludingTax || '',
              $cellEdit: true
            };
          }) || [];
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    },
    handleDeleteSupplier(row, index) {
      this.form.suppliers.splice(index, 1);
    },
    handleInputRate(event, scope) {
      const currentItem = this.ladderOption.data[scope.row.$index];
      const result = execMathExpress('v1 / ( v2 + v3 )', {
        v1: currentItem.priceIncludingTax,
        v2: 1,
        v3: event.target.value
      });
      currentItem.priceExcludingTax = Math.floor((result.num / result.den) * 100) / 100;
    },
    handleInputPrice(event, scope) {
      const currentItem = this.ladderOption.data[scope.row.$index];
      const result = execMathExpress('v1 / ( v2 + v3 )', {
        v1: event.target.value,
        v2: 1,
        v3: currentItem.taxRate
      });
      currentItem.priceExcludingTax = Math.floor((result.num / result.den) * 100) / 100;
    },
    handleSubmit() {
      let result = false;
      this.ladderOption.data.forEach((item) => {
        if (
          validatenull(item.priceIncludingTax) ||
          validatenull(item.priceExcludingTax) ||
          validatenull(item.taxRate)
        ) {
          result = true;
        }
      });
      if (result) {
        this.$message.error('请填写完整报价信息');
        return;
      }
      const params = {
        ...this.form,
        ladderPriceJson: JSON.stringify(this.ladderOption.data),
        remark: this.form.remark
      };
      this.$emit('on-save-form', params);
    }
  }
};
</script>
