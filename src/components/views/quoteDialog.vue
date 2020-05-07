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
        <avue-crud :data="ladderOption.data" :option="ladderOption.option"> </avue-crud>
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
import ladderOption from '@/const/rfq/supplierClient/quoteList';

export default {
  name: 'quote-dialog',
  components: {},
  created: function() {},
  props: {
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
      console.log('newVal', newVal);
      this.form = newVal;
      this.ladderOption.data =
        JSON.parse(newVal.ladderPriceJson).map((item) => {
          return {
            ladderQuantity: item.ladderQuantity,
            ladderGrade: item.ladderGrade,
            priceIncludingTax: item.priceIncludingTax || '',
            taxRate: item.taxRate || '',
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
    handleSubmit() {
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
