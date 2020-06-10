<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <el-row>
      <el-col span="4">
        <avue-crud :option="costTemplateSum.option" :data="sumData"></avue-crud>
      </el-col>
      <el-col span="20">
        <fast2-config-tab-render
          :readOnly="true"
          :tabView="false"
          :tabPermission="tabPermission"
          :list="template"
          :providerData="data"
        ></fast2-config-tab-render>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import costTemplateSum from '@/const/rfq/costTemplateSum';
// 成本模板、数据
export default {
  name: 'cost-template-dialog',
  components: {},
  created() {},
  props: {
    dialogWidth: String,
    dialogTitle: String,
    fieldDialogVisible: {
      type: Boolean,
      default: false
    },
    tabPermission: Object,
    template: Array,
    data: Object
  },
  data() {
    return {
      sumData: [],
      costTemplateSum: costTemplateSum
    };
  },
  watch: {
    template(newValue) {
      console.log(newValue);
      this.sumData = newValue.map((item) => {
        if (item.propData.tableData && item.propData.tableData.length > 0) {
          let price = 0;
          item.propData.tableData.forEach((t) => {
            const formula = this.$getFormulaItem(item.prop);
            price += this.$getFormulaValue(formula, t).price;
          });
          return {
            key: item.label,
            value: price
          };
        } else if (item.propData.formData) {
          const formula = this.$getFormulaItem(item.prop);
          let price = this.$getFormulaValue(formula, item.propData.formData).price;
          return {
            key: item.label,
            value: price
          };
        }
        return {
          key: item.label,
          value: 0
        };
      });
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    }
  }
};
</script>
