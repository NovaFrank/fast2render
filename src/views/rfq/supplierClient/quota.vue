<template>
  <basic-container>
    <form-header
      titleText="报价详情"
      showButton
      :buttons="headerButtons"
      @on-back="handleBack"
      @on-history="handleShowHistory"
      @on-save="handleSave"
      @on-send="handleSend"
    ></form-header>
    <avue-form ref="form" v-model="detailObj" :option="formOption">
      <template slot="enquiryType">
        <el-select
          v-model="detailObj.enquiryType"
          @change="handleEnquiryTypeChange"
          filterable
          clearable
          disabled
          placeholder="请选择 成本模板"
        >
          <el-option
            v-for="item in requestTypeDict"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </template>
    </avue-form>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <fast2-attachment-list
      :id="detailObj.enquiryNumber"
      :elsAccount="elsAccount"
      :businessElsAccount="detailObj.toElsAccount"
      businessModule="enquiry"
      :readonly="true"
      v-show="tabActive === 'files'"
    ></fast2-attachment-list>
    <avue-crud
      v-show="tabActive === 'detail'"
      :data="inquiryListOption.data"
      :option="inquiryListOption.option"
      :page.sync="inquiryListOption.page"
      v-model="inquiryListOption.obj"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot-scope="scope" slot="priceIncludingTax">
        <span v-if="scope.row.quoteMethod === '0'">{{ scope.row.priceIncludingTax }}</span>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '1'">
          {{ getPriceIndex(scope.row, 'priceIncludingTax') }}
        </p>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '2'">
          {{ getCostPriceIndex(scope.row, 'priceIncludingTax') }}
        </p>
      </template>
      <template slot-scope="scope" slot="priceExcludingTax">
        <span v-if="scope.row.quoteMethod === '0'">{{ scope.row.priceExcludingTax }}</span>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '1'">
          {{ getPriceIndex(scope.row, 'priceExcludingTax') }}
        </p>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '2'">
          {{ getCostPriceIndex(scope.row, 'priceExcludingTax') }}
        </p>
      </template>
      <template slot-scope="scope" slot="quoteMethod">
        <span v-for="method in quoteMethodData" :key="method.value">
          <span v-if="scope.row.quoteMethod === method.value">{{ method.label }}</span>
        </span>
      </template>
      <template slot-scope="scope" slot="quoteMethodInfo">
        <span v-if="scope.row.quoteMethod === '1'">
          <p
            style="margin: 0"
            v-for="ladder in JSON.parse(scope.row.ladderPriceJson)"
            :key="ladder.ladderGrade"
          >
            {{ ladder.ladderGrade }}
          </p>
        </span>
      </template>
      <template slot-scope="scope" slot="costTemplate">
        <el-link
          class="el-button el-button--text el-button--small"
          @click.stop="handleShowCostTemplate(scope)"
          v-if="scope.row.quoteMethod === '2'"
        >
          {{ JSON.parse(scope.row.costConstituteJson).templateName }}
        </el-link>
      </template>
      <template slot-scope="scope" slot="quote">
        <avue-radio
          v-model="scope.row.noQuoted"
          :disabled="!['1', '3'].includes(scope.row.itemStatus)"
          :dic="dic"
          @change="(value) => handleRadioChange(value, scope)"
        ></avue-radio>
      </template>
      <template slot-scope="scope" slot="menu">
        <el-button
          v-if="scope.row.noQuoted !== 'N' && ['1', '3'].includes(scope.row.itemStatus)"
          @click.stop="handleQuoteRow(scope)"
          class="el-button el-button--text el-button--small"
        >
          <i class="el-icon-edit"></i>
          报价
        </el-button>
      </template>
    </avue-crud>
    <!-- 常规报价 -->
    <quote-dialog
      :dialogTitle="dialogTitle"
      :field="fieldDialogForm"
      :fieldDialogVisible="quoteVisible"
      :dialogWidth="dialogWidth"
      @on-save-form="onSaveForm"
      @close-field-dialog="closeFieldDialog"
    ></quote-dialog>
    <!-- 阶梯报价 -->
    <quote-ladder-dialog
      :dialogTitle="dialogTitle"
      :field="fieldDialogForm"
      :fieldDialogVisible="ladderQuoteVisible"
      :dialogWidth="dialogWidth"
      @on-save-form="onSaveLadderForm"
      @close-field-dialog="closeFieldDialog"
    ></quote-ladder-dialog>
    <!-- 成本报价 -->
    <cost-quote-dialog
      :dialogTitle="dialogTitle"
      :field="costDialogForm"
      :fieldDialogVisible="costQuoteVisible"
      :dialogWidth="dialogWidth"
      @on-save-form="onSaveCostForm"
      @close-field-dialog="closeFieldDialog"
    ></cost-quote-dialog>
    <!-- 报价历史记录 -->
    <history
      :dialogVisible="historyVisible"
      :data="historyList"
      :quoteMethodData="quoteMethodData"
    ></history>
    <!-- 成本报价模板 -->
    <cost-template-dialog
      dialogTitle="成本报价"
      dialogWidth="70%"
      :tabPermission="tabPermission"
      :template="template"
      :data="providerData"
      :fieldDialogVisible.sync="costDialogVisible"
      @close-field-dialog="closeFieldDialog"
    ></cost-template-dialog>
  </basic-container>
</template>

<script>
import FormHeader from '@/components/views/formHeader';
import costQuoteDialog from '@/components/views/costQuoteDialog'; // 成本报价
import quoteLadderDialog from '@/components/views/ladderQuoteDialog'; // 阶梯报价
import quoteDialog from '@/components/views/quoteDialog'; // 常规报价
import formOption from '@/const/rfq/supplierClient/detail';
import tabOption from '@/const/rfq/newAndView/tabs';
import filesOption from '@/const/rfq/newAndView/fileList';

import costTemplateDialog from '@/components/views/costTemplateDialog';
import { getAction, postAction, queryQuote } from '@/api/rfq/supplierClient';
import inquiryListOption from '@/const/rfq/supplierClient/inquiryList';
import history from './../history';
import { validatenull } from '@/util/validate';
import { dataDicAPI } from '@/api/rfq/common';
import { ElsTemplateConfigService } from '@/api/templateConfig.js';

const execMathExpress = require('exec-mathexpress');

export default {
  components: {
    FormHeader,
    quoteDialog,
    quoteLadderDialog,
    costQuoteDialog,
    history,
    costTemplateDialog
  },
  data() {
    return {
      dic: [
        {
          label: '否',
          value: 'N'
        },
        {
          label: '是', // 行信息 itemStatus
          value: 'Y'
        }
      ],
      formOption: formOption,
      tabOption: tabOption,
      inquiryListOption: inquiryListOption,
      filesOption: filesOption,
      tabActive: 'detail',
      detailObj: {},
      filesForm: {},
      fieldDialogForm: {},
      costDialogForm: {},
      quoteVisible: false,
      ladderQuoteVisible: false,
      costQuoteVisible: false,
      historyVisible: false,
      costDialogVisible: false,
      historyList: [],
      quoteMethodData: [],
      dialogTitle: '',
      dialogWidth: '50%',
      headerButtons: [
        { power: true, text: '返回', type: '', size: '', action: 'on-back' },
        { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
        { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' },
        { power: true, text: '发送', type: 'primary', size: '', action: 'on-send' }
      ],
      currentEnquiryNumber: '',
      requestTypeDict: [],
      configurations: {}
    };
  },
  created() {
    this.currentEnquiryNumber = this.$route.params.enquiryNumber;
    this.$getBlockItem('rfq-header-detail').then((res) => {
      this.formOption.column = res[0].data.column.map((item) => {
        item.disabled = true;
        if (item.prop === 'companyCode') item.type = 'tree';
        if (item.prop === 'quoteEndTime') {
          item.type = 'datetime';
          item.format = 'yyyy-MM-dd HH:mm:ss';
          item.valueFormat = 'timestamp';
        }
        if (item.prop === 'createDate') {
          item.type = 'date';
          item.format = 'yyyy-MM-dd';
          item.valueFormat = 'timestamp';
        }
        if (item.prop === 'enquiryType') {
          item.type = 'select';
          item.formslot = true;
        }
        return item;
      });
    });
    this.tableData();
  },
  watch: {
    detailObj(newVal) {
      if (!validatenull(newVal.enquiryType)) {
        this.handleEnquiryTypeChange(newVal.enquiryType);
      }
    }
  },
  methods: {
    handleEnquiryTypeChange(value) {
      this.inquiryListOption.option.column = [
        { label: '物料编号', prop: 'materialNumber' },
        { label: '物料名称', prop: 'materialName' },
        { label: '物料描述', prop: 'materialDesc' },
        { label: '规格', prop: 'materialSpecifications' },
        { label: '单位', prop: 'baseUnit', span: 4 },
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '要求交期',
          prop: 'deliveryDate'
        },
        { label: '需求数量', prop: 'quantity' },
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '交货日期',
          prop: 'deliveryDate'
        },
        { slot: true, label: '阶梯信息', prop: 'quoteMethodInfo' },
        { slot: true, label: '成本模板', prop: 'costTemplate' },
        { slot: true, label: '含税价', prop: 'priceIncludingTax' },
        { label: '税率', prop: 'taxRate' },
        { slot: true, label: '不含税价', prop: 'priceExcludingTax' }
      ];
      const current = this.configurations[value].tableColumns.map((item) => {
        let result = {};
        result.prop = item.prop;
        result.label = item.label;
        result.display = item.saleShow;
        result.span = item.span;
        return result;
      });
      this.inquiryListOption.option.column = this.inquiryListOption.option.column.concat(current);
      this.inquiryListOption.option.column.push({
        slot: true,
        label: '是否报价',
        type: 'switch',
        prop: 'quote'
      });
    },
    async tableData(data) {
      // 报价方式 数据字典
      dataDicAPI('quoteMethod').then((res) => {
        this.quoteMethodData = res.data;
      });
      const res = await ElsTemplateConfigService.find({
        elsAccount: this.elsAccount || '307000',
        businessModule: 'enquiry',
        currentVersionFlag: 'Y'
      });
      if (res.data && res.data.statusCode === '200' && res.data.pageData) {
        let configurations = [];
        const rows = res.data.pageData.rows || [];
        for (const item of rows) {
          const json = JSON.parse(item.configJson);
          const table = json.table;
          this.requestTypeDict.push({
            value: item.templateNumber,
            label: item.templateName
          });
          configurations[item.templateNumber] = {
            name: item.templateName,
            tableColumns: table
          };
        }
        this.configurations = configurations;
      }
      this.initDetail();
    },
    getPriceIndex(row, column) {
      const quantity = row.quantity;
      const quantityList = JSON.parse(row.ladderPriceJson).map((item) => {
        return Number(item.ladderQuantity);
      });
      quantityList.push(quantity);
      const index = quantityList.findIndex((item) => item === Number(quantity));
      return JSON.parse(row.ladderPriceJson)[index - 1][column];
    },
    getCostPriceIndex(row, column) {
      const costJson = JSON.parse(row.costConstituteJson);
      const template = costJson.templateJson;
      let price = 0;
      template.forEach((item) => {
        if (item.propData && item.propData.tableData && item.propData.tableData.length > 0) {
          item.propData.tableData.forEach((t) => {
            const formula = this.$getFormulaItem(item.prop);
            price += this.$getFormulaValue(formula, t).price;
          });
        } else if (item.propData && item.propData.formData) {
          const formula = this.$getFormulaItem(item.prop);
          price += this.$getFormulaValue(formula, item.propData.formData).price;
        }
      });
      if (column === 'priceExcludingTax') {
        const result = execMathExpress('v1 / ( v2 + v3 )', {
          v1: price || 0,
          v2: 1,
          v3: row.taxRate
        });
        price = Math.floor((result.num / result.den) * 100) / 100;
      }
      return price || 0;
    },
    closeFieldDialog() {
      this.costQuoteVisible = false;
      this.ladderQuoteVisible = false;
      this.quoteVisible = false;
      this.costDialogVisible = false;
    },
    currentChange(val) {
      this.inquiryListOption.page.currentPage = val;
      this.tableData({
        currentPage: val,
        pageSize: this.inquiryListOption.page.pageSize
      });
    },
    handleBack() {
      this.$router.back();
    },
    handleShowHistory() {
      queryQuote({
        enquiryNumber: this.detailObj.enquiryNumber,
        toElsAccount: this.detailObj.toElsAccount
      }).then((res) => {
        this.historyList = res.data.pageData.rows;
      });
      this.historyVisible = true;
    },
    handleShowCostTemplate(scope) {
      const costJson = JSON.parse(scope.row.costConstituteJson);
      this.template = costJson.templateJson;
      this.tabPermission = costJson.permissionJson;
      this.providerData = {};
      this.template.forEach((element) => {
        this.providerData[element.prop] = element.propData;
      });
      this.costDialogVisible = true;
    },
    // 显示报价弹窗
    handleQuoteRow(scope) {
      this.dialogTitle = `${scope.row.materialNumber}(${scope.row.materialName})物料报价弹框`;
      if (scope.row.quoteMethod === '0') {
        this.quoteVisible = true;
        this.fieldDialogForm = {
          index: scope.index,
          taxRate: scope.row.taxRate,
          remark: scope.row.remark || ''
        };
      } else if (scope.row.quoteMethod === '1') {
        this.fieldDialogForm = {
          index: scope.index,
          taxRate: scope.row.taxRate,
          ladderPriceJson: scope.row.ladderPriceJson || null,
          remark: scope.row.remark || ''
        };
        this.ladderQuoteVisible = true;
      } else if (scope.row.quoteMethod === '2') {
        const costJson = JSON.parse(scope.row.costConstituteJson);
        const template = costJson.templateJson;
        const tabPermission = costJson.permissionJson;
        const templateName = costJson.templateName;
        let providerData = {};
        template.forEach((element) => {
          providerData[element.prop] = element.propData;
        });

        this.costDialogForm = {
          index: scope.index,
          costConstituteJson: scope.row.costConstituteJson || null,
          templateName,
          tabPermission,
          template,
          providerData
        };
        this.costQuoteVisible = true;
      }
    },
    handleRadioChange(value, scope) {
      if (value === 'N') {
        this.inquiryListOption.data[scope.row.$index].priceIncludingTax = '';
        this.inquiryListOption.data[scope.row.$index].priceExcludingTax = '';
        this.inquiryListOption.data[scope.row.$index].cellEdit = false;
      } else {
        this.inquiryListOption.data[scope.row.$index].cellEdit = true;
        // }
      }
    },
    handleSave() {
      this.inquiryListOption.data.forEach((element) => {
        console.log(element.priceIncludingTax);
      });
      const params = {
        enquiryNumber: this.currentEnquiryNumber,
        saleItemList: this.inquiryListOption.data
      };
      postAction('save', params).then((res) => {
        if (res.data.statusCode !== '200') {
          this.$message.error(res.data.message);
          return;
        }
        this.$message.success('保存成功');
      });
    },
    handleSend() {
      let result = true;
      this.inquiryListOption.data.forEach((item) => {
        if (
          item.noQuoted !== 'N' &&
          item.quoteMethod === '0' &&
          validatenull(item.priceIncludingTax)
        ) {
          // 常规报价
          result = false;
        }
        if (item.noQuoted !== 'N' && item.quoteMethod === '1') {
          JSON.parse(item.ladderPriceJson).forEach((ladder) => {
            if (validatenull(ladder.priceIncludingTax)) {
              result = false;
            }
          });
        }
        // if (item.noQuoted !== 'N' && item.quoteMethod === '2') {
        //   const costJson = JSON.parse(item.costConstituteJson);
        //   const template = costJson.templateJson;
        //   const tabPermission = costJson.permissionJson;
        //   template.forEach((item) => {
        //     console.log(
        //       item.prop,
        //       !validatenull(tabPermission[item.prop]),
        //       item.propData.tableData,
        //       item.propData.tableData.length === 0,
        //       item.propData.formData,
        //       validatenull(item.propData.formData),
        //       !validatenull(tabPermission[item.prop]) &&
        //         item.propData.tableData.length === 0 &&
        //         validatenull(item.propData.formData)
        //     );
        //     if (
        //       tabPermission[item.prop] &&
        //       item.propData.tableData.length === 0 &&
        //       validatenull(item.propData.formData)
        //     ) {
        //       result = false;
        //     }
        //   });
        // }
      });
      if (!result) {
        this.$message.error('请完善报价信息');
        return;
      }
      this.$confirm('是否发送报价？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          quoteEndTime: this.detailObj.quoteEndTime,
          enquiryNumber: this.currentEnquiryNumber,
          toElsAccount: this.detailObj.toElsAccount,
          saleItemList: this.inquiryListOption.data
        };
        postAction('quote', params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('发送成功');
          this.$router.back();
        });
      });
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    initDetailError(res) {
      if (res.data.statusCode !== '200') {
        this.$message.error(res.data.message);
        return false;
      }
      return true;
    },
    initDetail() {
      this.detailObj = {};
      this.inquiryListOption.data = [];
      getAction('findHeadDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.detailObj = res.data.data;
      });
      getAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          return {
            // $cellEdit: ['1', '3'].includes(item.itemStatus) && item.noQuoted === 'Y', // 重报价/报价中，且报价 是
            ...item,
            noQuoted: item.noQuoted || 'Y'
          };
        });
      });
    },
    // 行信息 - 常规报价保存
    onSaveForm(form) {
      this.quoteVisible = false;
      this.$set(
        this.inquiryListOption.data[form.index],
        'priceIncludingTax',
        form.priceIncludingTax
      );
      this.$set(this.inquiryListOption.data[form.index], 'taxRate', form.taxRate);
      this.$set(
        this.inquiryListOption.data[form.index],
        'priceExcludingTax',
        form.priceExcludingTax
      );
      this.$set(this.inquiryListOption.data[form.index], 'remark', form.remark);
    },
    // 行信息 - 阶梯报价保存
    onSaveLadderForm(form) {
      this.ladderQuoteVisible = false;
      this.$set(
        this.inquiryListOption.data[form.index],
        'ladderPriceJson',
        form.ladderPriceJson || null
      );
      this.$set(this.inquiryListOption.data[form.index], 'remark', form.remark);
    },
    // 行信息 - 成本报价保存
    onSaveCostForm(form) {
      console.log(form);
      this.costQuoteVisible = false;
      this.$set(
        this.inquiryListOption.data[form.index],
        'costConstituteJson',
        form.costConstituteJson || null
      );
    },
    sizeChange(val) {
      this.inquiryListOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    }
  }
};
</script>
