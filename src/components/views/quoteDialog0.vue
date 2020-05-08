<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="quoteFormOption.option" v-model="form" class="new-field">
      <template slot="menuForm">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import quoteFormOption from '@/const/rfq/supplierClient/quoteForm0';
import ladderOption from '@/const/rfq/supplierClient/quoteList';

// 销售方常规报价
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
      this.form = newVal;
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
        remark: this.form.remark
      };
      this.$emit('on-save-form', params);
    }
  }
};
</script>
