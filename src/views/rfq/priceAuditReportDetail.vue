<template>
  <basic-container>
    <form-header titleText="询价审批报告"></form-header>
    <avue-form ref="form" v-model="detailObj" :option="formOption"></avue-form>
    <!-- 询价明细 -->
    <avue-crud
      :data="inquiryListOption.data"
      :option="inquiryListOption.option"
      :page.sync="inquiryListOption.page"
      v-model="inquiryListOption.obj"
      :span-method="spanMethod"
      @current-change="currentChange"
      @row-click="handleDetailItemClick"
      @size-change="sizeChange"
    >
      <template slot="menuLeft">
        <el-button size="small" @click.stop="handleShowSupplierSelect()">新供应商</el-button>
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
      <!-- 成本模板 -->
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
      <template slot="taxRate" slot-scope="scope">
        {{ scope.row.taxRate }}
      </template>
      <!-- 含税 -->
      <template slot-scope="scope" slot="priceIncludingTax">
        <span v-if="scope.row.quoteMethod === '0'">
          <span v-if="showXPrice(scope.row)">
            **
          </span>
          <span v-else>{{ scope.row.priceIncludingTax }}</span>
        </span>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '1'">
          <span v-if="showXPrice(scope.row)">
            **
          </span>
          <span v-else>{{ getPriceIndex(scope.row, 'priceIncludingTax') }}</span>
        </p>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '2'">
          <span v-if="showXPrice(scope.row)">
            **
          </span>
          <span v-else>{{ getCostPriceIndex(scope.row, 'priceIncludingTax') }}</span>
        </p>
      </template>
      <!-- 不含税 -->
      <template slot-scope="scope" slot="priceExcludingTax">
        <span v-if="scope.row.quoteMethod === '0'">
          <span v-if="showXPrice(scope.row)">
            **
          </span>
          <span v-else>{{ scope.row.priceExcludingTax }}</span>
        </span>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '1'">
          <span v-if="showXPrice(scope.row)">
            **
          </span>
          <span v-else>{{ getPriceIndex(scope.row, 'priceExcludingTax') }}</span>
        </p>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '2'">
          <span v-if="showXPrice(scope.row)">
            **
          </span>
          <span v-else>{{ getCostPriceIndex(scope.row, 'priceExcludingTax') }}</span>
        </p>
      </template>
    </avue-crud>
    <avue-form ref="form" v-model="reasonObj" :option="reasonOption"></avue-form>
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
import { setStore } from '@/util/store.js';
import FormHeader from '@/components/views/formHeader';
import formOption from '@/const/rfq/priceBids/reportHeader';
import inquiryListOption from '@/const/rfq/priceBids/reportInquiryList';

import { getUserInfo, compare } from '@/util/utils.js';
import { queryDetailAction, submitAudit } from '@/api/rfq';
import { validatenull } from '@/util/validate';

import costTemplateDialog from '@/components/views/costTemplateDialog';
import { ElsTemplateConfigService } from '@/api/templateConfig.js';
// import { dataDicAPI } from '@/api/rfq/common';

const execMathExpress = require('exec-mathexpress');

export default {
  components: { FormHeader, costTemplateDialog },
  data() {
    return {
      reasonObj: {},
      reasonOption: {
        menuBtn: false,
        detail: true,
        column: [
          {
            span: 24,
            label: '推荐理由',
            prop: 'reason',
            type: 'textarea'
          }
        ]
      },
      isAudit: false,
      elsAccount: '',
      elsSubAccount: '',
      dic: [
        {
          label: '接受', // 行信息 itemStatus
          value: '4'
        },
        {
          label: '拒绝',
          value: '5'
        }
      ],
      formOption: formOption,
      inquiryListOption: inquiryListOption,
      detailObj: {},
      headerButtons: [
        { power: true, text: '提交', type: 'primary', size: '', action: 'on-submit-approval' },
        { power: true, text: '取消', type: '', size: '', action: 'on-back' }
      ],
      quoteMethodData: [],
      costDialogVisible: false,
      currentEnquiryNumber: '',
      requestTypeDict: [],
      configurations: {}
    };
  },
  created() {
    this.isAudit = this.$route.query.isAudit || false;
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.currentEnquiryNumber = this.$route.params.enquiryNumber;
    this.tableData();
  },
  watch: {},
  methods: {
    showXPrice(item) {
      // 显示星星：限时、加密
      const canSee = this.detailObj.canSeeRule || '0';
      let result =
        ((item.itemStatus === '2' || item.itemStatus === '4') &&
          this.detailObj.quoteEndTime > new Date().getTime() &&
          canSee === '0') ||
        (canSee === '1' && this.detailObj.showQuoteInfo !== 'Y');
      return result;
    },
    async tableData(data) {
      const res = await ElsTemplateConfigService.find({
        elsAccount: this.elsAccount,
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
      // 报价方式 数据字典
      // dataDicAPI('quoteMethod').then((res) => {
      //   this.quoteMethodData = res.data;
      // });
      this.initDetail();
    },
    handleEnquiryTypeChange(value) {
      this.inquiryListOption.option.column = [
        { label: '物料编号', prop: 'materialNumber' },
        { label: '物料名称', prop: 'materialName' },
        { label: '物料描述', prop: 'materialDesc' },
        {
          label: '单位',
          prop: 'baseUnit',
          span: 4
        },
        { label: '需求数量', prop: 'quantity' },
        // { slot: true, label: '报价方式', prop: 'quoteMethod' },
        // { slot: true, label: '阶梯信息', prop: 'quoteMethodInfo' },
        // { slot: true, label: '成本模板', prop: 'costTemplate' },
        { label: '供应商', prop: 'companyShortName' },
        {
          type: 'select',
          label: '供应商状态',
          prop: 'supplierType',
          dicData: [
            { label: '合格供应商', value: '1' },
            { label: '潜在供应商', value: '2' },
            { label: '陌生供应商', value: '3' },
            { label: '淘汰供应商', value: '4' }
          ]
        },
        {
          type: 'select',
          label: '状态',
          prop: 'itemStatus',
          dicData: [
            { label: '报价中', value: '1' },
            { label: '已报价', value: '2' },
            { label: '重报价', value: '3' },
            { label: '已接受', value: '4' },
            { label: '已拒绝', value: '5' },
            { label: '已关闭', value: '6' }
          ]
        },
        { slot: true, label: '税率', prop: 'taxRate' },
        { slot: true, label: '含税价', prop: 'priceIncludingTax' },
        { slot: true, label: '不含税价', prop: 'priceExcludingTax' },
        // {
        //   type: 'date',
        //   format: 'yyyy-MM-dd',
        //   valueFormat: 'timestamp',
        //   label: '交货日期',
        //   prop: 'deliveryDate'
        // },
        { label: '配额', prop: 'quota' }
      ];
      if (!validatenull(this.configurations)) {
        const current = this.configurations[value].tableColumns.map((item) => {
          let result = {};
          result.prop = item.prop;
          result.label = item.label;
          result.display = item.purchaseShow;
          result.span = item.span;
          return result;
        });
        this.inquiryListOption.option.column = this.inquiryListOption.option.column.concat(current);
      }
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
      if (row.itemStatus === '1' || row.itemStatus === '3') {
        return '**';
      }
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
          } else if (item.propData && !validatenull(item.propData.formData)) {
            const formula = this.$getFormulaItem(item.prop);
            price += Number(this.$getFormulaValue(formula, item.propData.formData).price);
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
        return price || '';
      }
      return '';
    },
    closeFieldDialog() {
      this.openDialogVisible = false;
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
    handleShowCostTemplate(scope) {
      if (
        scope.row.itemStatus !== '1' &&
        scope.row.itemStatus !== '3' &&
        !this.showXPrice(scope.row)
      ) {
        const costJson = JSON.parse(scope.row.costConstituteJson);
        this.template = costJson.templateJson;
        this.tabPermission = costJson.permissionJson;
        this.providerData = {};
        this.template.forEach((element) => {
          this.providerData[element.prop] = element.propData;
        });
        this.costDialogVisible = true;
      } else {
        console.log('....');
      }
    },
    handleSubmitApproval() {
      let status = true;
      let result = false;
      this.inquiryListOption.data.forEach((item) => {
        if (item.itemStatus === '4') {
          status = false; // 必须有接受的报价才能够提交审批
        }
        if (item.itemStatus === '4') {
          let quote = 0;
          this.inquiryListOption.data
            .filter(
              (itemF) => itemF.materialNumber === item.materialNumber && item.itemStatus === '4'
            )
            .forEach((itemQuota) => {
              quote += Number(itemQuota.quota);
            });
          if (Number(quote) !== 100) result = true; // 相同物料 已报价 分配的配额必须相加为100
        }
      });
      if (status) {
        this.$message.error('必须有接受状态的报价才能够提交审批');
        return;
      }
      if (result) {
        this.$message.error('物料配额必须等于100');
        return;
      }
      this.$confirm('是否提交审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const action = 'submit';
        const param = {
          enquiryNumber: this.currentEnquiryNumber,
          elsAccount: this.elsAccount,
          quoteEndTime: this.detailObj.quoteEndTime,
          enquiryType: this.detailObj.enquiryType,
          enquiryDesc: this.detailObj.enquiryDesc,
          companyCode: this.detailObj.companyCode,
          enquiryMethod: this.detailObj.enquiryMethod || '',
          itemList: this.inquiryListOption.data
        };
        let params = {
          elsAccount: this.detailObj.elsAccount,
          // toElsAccount: this.detailObj.toElsAccount,
          businessType: 'bargainEnquiryAudit',
          businessId: this.detailObj.enquiryNumber,
          params: JSON.stringify(param)
        };
        submitAudit(action, params).then((res) => {
          if (res.data.statusCode === '200') {
            this.$message.success('提交审批成功');
            this.$router.go(0);
            return;
          }
          this.$message.error('提交审批失败');
        });
      });
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
      queryDetailAction('findHeadDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.detailObj = res.data.data;
        this.inquiryListOption.option.header = false;
        this.reasonObj.reason = this.detailObj.reason;
        const current = this.configurations[this.detailObj.enquiryType];
        if (current.rule) this.templateRule = current.rule;
        else this.templateRule = {};
        if (this.templateRule.enquiryIsQuota === true)
          this.inquiryListOption.option.column.push({ label: '配额', prop: 'quota', cell: true });

        if (res.data.data.flowCode) {
          let content = {
            flowId: res.data.data.flowCode,
            businessType: 'bargainEnquiryAudit',
            auditStatus: res.data.data.auditStatus
          };
          setStore({ name: this.currentEnquiryNumber, content, type: true });
        }
      });
      queryDetailAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          return {
            id: item.uuid,
            ...item
          };
        });

        this.inquiryListOption.data = this.inquiryListOption.data.sort(compare('materialNumber'));
      });
    }
  }
};
</script>

<style>
.avue-crud__pagination {
  height: 0;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 10px 20px;
}
</style>
