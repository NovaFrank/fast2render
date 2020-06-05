<template>
  <el-dialog
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :visible.sync="fieldDialogVisible"
    :before-close="closeDialog"
  >
    <avue-form ref="form" :option="quoteFormOption.option" v-model="form" class="new-field">
      <!-- 成本询价 -->
      <template slot="costConstituteJson">
        <fast2-cost-config-tab-render
          :list="template"
          :providerData="providerData"
        ></fast2-cost-config-tab-render>
      </template>
      <template slot="menuForm">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import quoteFormOption from '@/const/rfq/supplierClient/costQuoteForm';
import ladderOption from '@/const/rfq/supplierClient/quoteList';
// import { unzipLayout, zipLayout } from './../../../fast2render/lib/utils.js';

const execMathExpress = require('exec-mathexpress');

// 销售方阶梯报价
export default {
  name: 'quote-ladder-dialog',
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
          costConstituteJson: []
        };
      }
    }
  },
  data() {
    return {
      templateName: '',
      quoteFormOption: quoteFormOption,
      ladderOption: ladderOption,
      template: [],
      providerData: {},
      form: {
        costConstituteJson: []
      }
    };
  },
  watch: {
    field(newVal) {
      this.form = newVal;

      const costJson = JSON.parse(newVal.costConstituteJson);
      const templateData = costJson.templateJson;
      this.templateName = costJson.templateName;
      console.log(templateData);
      this.template = templateData;
      let data = {};
      templateData.forEach((element) => {
        data[element.prop] = element.propData;
      });
      this.providerData = data;
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-field-dialog');
    },
    handleSubmit() {
      this.form.costConstituteJson = this.template.map((item) => {
        return {
          ...item,
          propData: this.providerData[item.prop]
        };
      });
      const obj = {
        templateName: this.templateName,
        templateJson: this.form.costConstituteJson
      };
      const params = {
        ...this.form,
        costConstituteJson: JSON.stringify(obj)
      };
      this.$emit('on-save-form', params);
    }
  }
};
</script>
