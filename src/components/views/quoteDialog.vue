<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="quoteFormOption.option" v-model="form" class="new-field">
      <template slot="priceIncludingTax">
        <el-input placeholder="请输入 含税价" v-model="form.priceIncludingTax"></el-input>
      </template>
      <template slot="menuForm">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import quoteFormOption from '@/const/rfq/supplierClient/quoteForm';
import { validatenull } from '@/util/validate';

const execMathExpress = require('exec-mathexpress');

// 销售方常规报价
export default {
  name: 'quote-dialog',
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
        return {};
      }
    }
  },
  data() {
    return {
      quoteFormOption: quoteFormOption,
      form: {
        remark: ''
      }
    };
  },
  watch: {
    enquiryPurchaserTax(newVal) {
      if (newVal === true) {
        this.quoteFormOption.option.column = this.quoteFormOption.option.column.map((item) => {
          if (item.prop === 'taxRate') {
            item.disabled = false;
          }
          return item;
        });
      } else {
        this.quoteFormOption.option.column = this.quoteFormOption.option.column.map((item) => {
          if (item.prop === 'taxRate') {
            item.disabled = true;
          }
          return item;
        });
      }
    },
    field(newVal) {
      this.form = newVal;
    },
    'form.priceIncludingTax'(newVal) {
      const result = execMathExpress('v1 / ( v2 + v3 )', {
        v1: newVal,
        v2: 1,
        v3: this.form.taxRate
      });
      this.form.priceExcludingTax = Math.floor((result.num / result.den) * 100) / 100;
    },
    'form.taxRate'(newVal) {
      const result = execMathExpress('v1 / ( v2 + v3 )', {
        v1: this.form.priceIncludingTax,
        v2: 1,
        v3: newVal
      });
      this.form.priceExcludingTax = Math.floor((result.num / result.den) * 100) / 100;
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    },
    handleDeleteSupplier(row, index) {
      this.form.suppliers.splice(index, 1);
    },
    handleSubmit() {
      if (validatenull(this.form.taxRate)) {
        this.$message.error('请填写税率');
        return;
      }
      const params = {
        ...this.form,
        remark: this.form.remark
      };
      this.$emit('on-save-form', params);
    }
  }
};
</script>
