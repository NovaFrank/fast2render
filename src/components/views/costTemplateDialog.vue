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
import { validatenull } from '@/util/validate';
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
      const permission = Object.keys(this.tabPermission);
      this.sumData = [];
      newValue.forEach((item) => {
        if (permission.includes(item.prop)) {
          let price = 0;
          if (item.propData && item.propData.tableData && item.propData.tableData.length > 0) {
            item.propData.tableData.forEach((t) => {
              const formula = this.$getFormulaItem(item.prop);
              const p = Number(this.$getFormulaValue(formula, t).price);
              price += p;
            });
          } else if (item.propData && !validatenull(item.propData.formData)) {
            const formula = this.$getFormulaItem(item.prop);
            price = Number(this.$getFormulaValue(formula, item.propData.formData).price);
          }
          this.sumData.push({
            key: item.label,
            value: price
          });
        }
      });
      // this.sumData = newValue.map((item) => {
      //   if (item.propData && item.propData.tableData && item.propData.tableData.length > 0) {
      //     let price = 0;
      //     item.propData.tableData.forEach((t) => {
      //       const formula = this.$getFormulaItem(item.prop);
      //       const p = Number(this.$getFormulaValue(formula, t).price);
      //       price += p;
      //     });
      //     return {
      //       key: item.label,
      //       value: price
      //     };
      //   } else if (item.propData && item.propData.formData) {
      //     const formula = this.$getFormulaItem(item.prop);
      //     let price = Number(this.$getFormulaValue(formula, item.propData.formData).price);
      //     return {
      //       key: item.label,
      //       value: price
      //     };
      //   }
      //   return {
      //     key: item.label,
      //     value: 0
      //   };
      // });
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    }
  }
};
</script>
