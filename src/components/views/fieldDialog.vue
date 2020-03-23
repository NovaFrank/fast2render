<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="dialogOption" v-model="form" class="new-field">
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
import supplierList from '@/const/rfq/newAndView/supplierList';

export default {
  name: 'field-dialog',
  components: {},
  created: function() {},
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
          suppliers: []
        };
      }
    }
  },
  data() {
    return {
      supplierList: supplierList,
      form: {
        suppliers: []
      }
    };
  },
  watch: {
    field(newVal) {
      console.log('newVal', newVal);
      this.form = newVal;
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    },
    handleDeleteSupplier(row, index) {
      console.log(row, index);
      this.form.suppliers.splice(index, 1);
    },
    handleSaveSupplier(row, done) {
      console.log(row);
      this.form.suppliers.push(row);
      done();
    },
    handleShowSupplierSelect() {
      this.$emit('show-supplier-select');
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('on-save-form', this.form);
        }
      });
    }
  }
};
</script>
