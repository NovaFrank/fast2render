<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="dialogOption" v-model="form" class="new-field">
      <template slot="menuForm">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
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
          fromBusiness: ''
        };
      }
    }
  },
  data() {
    return {
      form: {}
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
