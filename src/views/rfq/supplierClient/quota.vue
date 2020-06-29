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
    <!-- 采购方附件 -->
    <fast2-attachment-list
      :id="detailObj.enquiryNumber"
      :elsAccount="detailObj.elsAccount"
      :businessElsAccount="detailObj.toElsAccount"
      businessModule="enquiry"
      :readonly="true"
      v-show="tabActive === 'files'"
      :passClient="false"
      :client="true"
      :clientTab="false"
      version="attahcment-fiels_4_3"
    ></fast2-attachment-list>
    <!-- 供应商附件 -->
    <fast2-attachment-list
      ref="attachment"
      :id="detailObj.enquiryNumber"
      :elsAccount="detailObj.elsAccount"
      :businessElsAccount="detailObj.toElsAccount"
      businessModule="enquiry"
      :readonly="detailObj.quoteEndTime < new Date().getTime() || !quoteStatus"
      v-show="tabActive === 'filesSupplier'"
      :passClient="false"
      :client="true"
      :clientTab="true"
      version="attahcment-fiels_4_3"
    ></fast2-attachment-list>
    <!-- 询价明细 -->
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
          {{
            JSON.parse(scope.row.costConstituteJson)
              ? JSON.parse(scope.row.costConstituteJson).templateName
              : ''
          }}
        </el-link>
      </template>
      <template slot-scope="scope" slot="quote">
        <avue-radio
          v-if="
            (scope.row.itemStatus === '1' && detailObj.quoteEndTime > new Date().getTime()) ||
              scope.row.itemStatus === '3'
          "
          v-model="scope.row.noQuoted"
          :disabled="!['1', '3'].includes(scope.row.itemStatus)"
          :dic="dic"
          @change="(value) => handleRadioChange(value, scope)"
        ></avue-radio>
      </template>
      <template slot-scope="scope" slot="menu">
        <el-button
          v-if="
            (scope.row.noQuoted !== 'N' &&
              scope.row.itemStatus === '1' &&
              detailObj.quoteEndTime > new Date().getTime()) ||
              scope.row.itemStatus === '3'
          "
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
      :enquiryPurchaserTax="templateRule ? templateRule.enquiryPurchaserTax : false"
    ></quote-dialog>
    <!-- 阶梯报价 -->
    <quote-ladder-dialog
      :enquiryPurchaserTax="templateRule ? templateRule.enquiryPurchaserTax : false"
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
      :detailObj="detailObj"
      :dialogVisible="historyVisible"
      :data="historyList"
      :quoteMethodData="quoteMethodData"
      @close-field-dialog="closeFieldDialog"
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
import tabOption from '@/const/rfq/supplierClient/detailTabs';
import filesOption from '@/const/rfq/newAndView/fileList';

import costTemplateDialog from '@/components/views/costTemplateDialog';
import { getAction, postAction, queryQuote } from '@/api/rfq/supplierClient';
import inquiryListOption from '@/const/rfq/supplierClient/inquiryList';
import history from './history';
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
      quoteStatus: false, // 是否为 未报价/重报价 状态，true 可保存、发送、附件操作，false 不可进行操作
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
        { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' }
      ],
      currentEnquiryNumber: '',
      requestTypeDict: [],
      configurations: {}
    };
  },
  async created() {
    this.currentEnquiryNumber = this.$route.params.enquiryNumber;
    await this.tableData();
  },
  watch: {
    detailObj(newVal) {
      if (!validatenull(newVal.enquiryType)) {
        this.handleEnquiryTypeChange(newVal.enquiryType);
      }
    }
  },
  methods: {
    initColumns() {
      this.formOption.column = [
        { label: '询价单号', span: 6, prop: 'enquiryNumber', disabled: true },
        { label: '询价名称', span: 6, prop: 'enquiryDesc', disabled: true },
        {
          type: 'select',
          dicUrl: '/layout/dics/value/enquiryType',
          dicMethod: 'get',
          formslot: true,
          label: '询价类型',
          span: 6,
          prop: 'enquiryType',
          disabled: true
        },
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '询价日期',
          span: 6,
          prop: 'createDate',
          disabled: true
        },
        {
          type: 'datetime',
          display: true,
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'timestamp',
          label: '报价截止时间',
          span: 6,
          prop: 'quoteEndTime',
          disabled: true
        },
        { label: '负责人', span: 6, prop: 'createUser', disabled: true }
      ];
      this.inquiryListOption.option.column = [
        { label: '物料编号', prop: 'materialNumber' },
        { label: '物料名称', prop: 'materialName' },
        { label: '物料描述', prop: 'materialDesc' },
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
    },
    handleEnquiryTypeChange(value) {
      if (this.configurations[value]) {
        this.templateRule = this.configurations[value].rule;
        const current = this.configurations[value].tableColumns.map((item) => {
          let result = {};
          result.prop = item.prop;
          result.label = item.label;
          result.display = item.saleShow;
          result.span = item.span;
          return result;
        });
        this.initColumns();
        this.inquiryListOption.option.column = this.inquiryListOption.option.column.concat(current);
        const fieldColumns = this.configurations[value].fieldColumns;
        fieldColumns.forEach((item) => {
          if (this.formOption.column.filter((i) => i.prop === item.prop).length === 0) {
            this.formOption.column.push({
              span: item.span || 6,
              ...item,
              disabled: true
            });
          }
        });
      } else {
        this.initColumns();
      }
      this.inquiryListOption.option.column.push({
        slot: true,
        label: '是否报价',
        type: 'switch',
        prop: 'quote'
      });
    },
    async tableData(data) {
      // 公开方式 数据字典
      dataDicAPI('enquiryMethod').then((res) => {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'enquiryMethod') {
            return {
              ...item,
              type: 'select',
              dicData: res.data
            };
          }
          return item;
        });
      });
      // 付款方式 数据字典
      dataDicAPI('payMethod').then((res) => {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'payMethod') {
            return {
              ...item,
              type: 'select',
              dicData: res.data
            };
          }
          return item;
        });
      });
      // 询价范围 数据字典
      dataDicAPI('enquiryScope').then((res) => {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'enquiryScope') {
            return {
              ...item,
              type: 'select',
              dicData: res.data
            };
          }
          return item;
        });
      });
      // 询价范围 数据字典
      dataDicAPI('currency').then((res) => {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'currency') {
            return {
              ...item,
              type: 'select',
              dicData: res.data
            };
          }
          return item;
        });
      });
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
          let field = [];
          console.log('json.fieldJson', json.fieldJson);
          Object.keys(json.fieldJson.sale).forEach((item) => {
            if (json.fieldJson.sale[item].display) {
              field.push({
                prop: item,
                ...json.fieldJson.purchase[item] // TODO: sale临时换purchase
              });
            }
          });
          this.requestTypeDict.push({
            value: item.templateNumber,
            label: item.templateName
          });
          configurations[item.templateNumber] = {
            name: item.templateName, // 模板名称
            rule: json.rule, // 单规则
            fieldColumns: field, // 头信息
            tableColumns: table // 行信息
          };
        }
        this.configurations = configurations;
      }
      this.initDetail();
    },
    getPriceIndex(row, column) {
      if (validatenull(row.ladderPriceJson)) return;
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
      if (costJson) {
        const template = costJson.templateJson;
        let price = 0;
        template.forEach((item) => {
          if (item.propData && item.propData.tableData && item.propData.tableData.length > 0) {
            item.propData.tableData.forEach((t) => {
              const formula = this.$getFormulaItem(item.prop);
              price += Number(this.$getFormulaValue(formula, t).price);
            });
          } else if (item.propData && item.propData.formData) {
            const formula = this.$getFormulaItem(item.prop);
            price += Number(this.$getFormulaValue(formula, item.propData.formData).price);
          }
        });
        if (column === 'priceExcludingTax') {
          const result = execMathExpress('v1 / ( v2 + v3 )', {
            v1: price || 0,
            v2: 1,
            v3: row.taxRate || 0
          });
          price = Math.floor((result.num / result.den) * 100) / 100;
        }
        return price || '';
      }
      return '';
    },
    closeFieldDialog() {
      this.costQuoteVisible = false;
      this.ladderQuoteVisible = false;
      this.quoteVisible = false;
      this.costDialogVisible = false;
      this.historyVisible = false;
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
        this.$refs.attachment
          .sendFiles()
          .then((res) => {
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
          })
          .catch((res) => {
            this.$message.error(res.message || '发布失败，请检查附件');
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
    async initDetail() {
      this.detailObj = {};
      this.inquiryListOption.data = [];
      const res = await getAction('findHeadDetails', this.currentEnquiryNumber);
      if (!this.initDetailError(res)) return;
      this.detailObj = res.data.data;

      getAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          if (['1', '3'].includes(item.itemStatus)) this.quoteStatus = true;
          return {
            // $cellEdit: ['1', '3'].includes(item.itemStatus) && item.noQuoted === 'Y', // 重报价/报价中(未报价)，且报价 是
            ...item,
            noQuoted: item.noQuoted || 'Y'
          };
        });
        if (this.detailObj.quoteEndTime < new Date().getTime() || !this.quoteStatus) {
          this.headerButtons = [
            { power: true, text: '返回', type: '', size: '', action: 'on-back' },
            { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' }
          ];
        } else {
          this.headerButtons = [
            { power: true, text: '返回', type: '', size: '', action: 'on-back' },
            { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
            { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' },
            { power: true, text: '发送', type: 'primary', size: '', action: 'on-send' }
          ];
        }
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
