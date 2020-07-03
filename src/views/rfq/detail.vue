<template>
  <basic-container>
    <form-header
      v-if="!isAudit"
      titleText="询价单详情"
      showButton
      :buttons="headerButtons"
      :timeHistory="timeHistory"
      @on-back="handleBack"
      @on-close="handleClose"
      @on-history="handleShowHistory"
      @on-new-supplier="handleNewSupplier"
      @on-open="handleShowOpen"
      @on-save-approval="handleSave"
      @on-submit-approval="handleSubmitApproval"
      @on-update-end="handleUpdateQuoteEndTime"
      @show-time-history="handleShowTimeHistory"
      @on-bid-price="handleBidPrice"
      @on-cancel-approval="handleCancelApproval"
    ></form-header>
    <div class="avue-form-box">
      <avue-form ref="form" v-model="detailObj" :option="formOption">
        <template slot="quoteEndTime">
          <el-date-picker
            v-model="quoteEndTimeChange"
            :disabled="detailObj.auditStatus === '0' || detailObj.auditStatus === '2'"
            type="datetime"
            placeholder="选择日期时间"
            value-format="timestamp"
            @change="handleQuoteEndTime"
          ></el-date-picker>
        </template>
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
    </div>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <!-- 单据规则 -->
    <fast2-block-provider
      v-show="tabActive === 'rules' && !validatenull(templateRule)"
      version="rfq-rule-setting"
    >
      <template slot-scope="component">
        <business-rule-config
          v-model="templateRule"
          :list="component.list"
          :readonly="true"
        ></business-rule-config>
      </template>
    </fast2-block-provider>
    <!-- 采购方附件 -->
    <fast2-attachment-list
      :id="detailObj.enquiryNumber"
      :elsAccount="elsAccount"
      :businessElsAccount="detailObj.elsAccount"
      businessModule="enquiry"
      :readonly="true"
      v-show="tabActive === 'files'"
      :passClient="false"
      :client="false"
      :clientTab="false"
      version="attahcment-fiels_4_3"
    ></fast2-attachment-list>
    <!-- 供应商附件 -->
    <fast2-attachment-list
      :id="detailObj.enquiryNumber"
      :elsAccount="detailObj.toElsAccount"
      :businessElsAccount="detailObj.elsAccount"
      businessModule="enquiry"
      :readonly="true"
      v-show="tabActive === 'filesSupplier'"
      :passClient="false"
      :client="false"
      :clientTab="true"
      :downloadClient="detailObj.quoteEndTime < new Date().getTime()"
      version="attahcment-fiels_4_3"
    ></fast2-attachment-list>
    <!-- 审批记录 -->
    <avue-crud
      v-show="tabActive === 'auditHistory'"
      :data="auditListOption.data"
      :option="auditListOption.option"
      :page.sync="auditListOption.page"
      v-model="auditListOption.obj"
    >
    </avue-crud>
    <!-- 询价明细 -->
    <avue-crud
      v-show="tabActive === 'detail'"
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
      <template slot-scope="scope" slot="materialNumber">
        <el-button
          @click="handleClickMaterial(scope)"
          class="el-button el-button--text el-button--small"
        >
          {{ scope.row.materialNumber }}
        </el-button>
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
        <!-- {{
          scope.row.itemStatus === '2' && detailObj.quoteEndTime > new Date().getTime()
            ? '**'
            : scope.row.taxRate
        }} -->
        {{ scope.row.taxRate }}
      </template>
      <!-- 含税 -->
      <template slot-scope="scope" slot="priceIncludingTax">
        <span v-if="scope.row.quoteMethod === '0'">
          <!-- (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
                detailObj.quoteEndTime > new Date().getTime() -->
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
      <!-- 接受/拒绝/重报价 -->
      <template slot-scope="scope" slot="option">
        <el-row
          v-if="
            detailObj.auditStatus !== '0' &&
              detailObj.auditStatus !== '2' &&
              scope.row.itemStatus !== '1' &&
              detailObj.quoteEndTime < new Date().getTime() &&
              !showXPrice(scope.row)
          "
          :gutter="24"
        >
          <el-col :span="12">
            <avue-radio
              v-model="scope.row.itemStatusCopy"
              :dic="dic"
              :disabled="detailObj.auditStatus === '0' || detailObj.auditStatus === '2'"
              @change="(value) => handleRadioChange(value, scope)"
            ></avue-radio>
          </el-col>
          <el-col :span="12">
            <el-button
              v-if="detailObj.auditStatus !== '0' && detailObj.auditStatus !== '2'"
              class="el-button el-button--text el-button--small"
              @click.stop="handleAgainQuote(scope.row)"
            >
              <span>重报价</span>
            </el-button>
          </el-col>
        </el-row>
      </template>
    </avue-crud>
    <!-- 报价历史记录 -->
    <history
      :detailObj="detailObj"
      :dialogVisible="historyVisible"
      :data="historyList"
      :quoteMethodData="quoteMethodData"
      @close-field-dialog="closeFieldDialog"
    ></history>
    <!-- 新供应商选择 -->
    <select-supplier-dialog
      ref="suppliersDialog"
      :dialogVisible.sync="suppliersDialogVisable"
      :title="'供应商'"
      :data="suppliersDialogOptionColumn.data"
      :crudObj="currentDetailItem"
      @on-save="suppliersDialogSaveTransfer"
    ></select-supplier-dialog>
    <open-dialog
      dialogTitle="开启密码"
      dialogWidth="30%"
      :fieldDialogVisible.sync="openDialogVisible"
      :dialogOption="openFormOption.option"
      @close-field-dialog="closeFieldDialog"
      @on-save-form="handleOpenSubmit"
    ></open-dialog>
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
import { mySpanMethod } from '@/util/utils';
import FormHeader from '@/components/views/formHeader';
import formOption from '@/const/rfq/newAndView/detail';
import tabOption from '@/const/rfq/newAndView/detailTabs';
import tabAuditOption from '@/const/rfq/newAndView/detailTabsAudit';
import inquiryListOption from '@/const/rfq/newAndView/detailInquiryList';
import auditListOption from '@/const/rfq/newAndView/auditListOption';
import filesOption from '@/const/rfq/newAndView/fileList';

import { getUserInfo, compare } from '@/util/utils.js';
import {
  purchaseEnquiryAction,
  queryDetailAction,
  submitAudit,
  cancelAudit,
  openPassWord,
  auditHisList
} from '@/api/rfq';
import { dataDicAPI, supplierMasterListAction } from '@/api/rfq/common';
import history from './history';
import { validatenull } from '@/util/validate';
import supplierSelectDialog from '@/const/rfq/newAndView/supplierSelectDialog';
import selectSupplierDialog from '@/components/views/selectSupplierDialog';
import quoteListOption from '@/const/rfq/newAndView/detailInquiryQuote';

import costTemplateDialog from '@/components/views/costTemplateDialog';
import openDialog from '@/components/views/openDialog';
import openFormOption from '@/const/rfq/newAndView/openForm';
import { setStore } from '@/util/store.js';
import { ElsTemplateConfigService } from '@/api/templateConfig.js';

const execMathExpress = require('exec-mathexpress');

export default {
  components: {
    FormHeader,
    history,
    selectSupplierDialog,
    openDialog,
    costTemplateDialog
  },
  data() {
    return {
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
      tabOption: tabOption,
      tabAuditOption: tabAuditOption,
      inquiryListOption: inquiryListOption,
      auditListOption: auditListOption,
      quoteListOption: quoteListOption,
      filesOption: filesOption,
      tabActive: 'detail',
      detailObj: {},
      filesForm: {},
      headerButtons: [],
      historyVisible: false,
      historyList: [],
      quoteMethodData: [],
      openDialogVisible: false,
      costDialogVisible: false,
      openFormOption: openFormOption,
      suppliersDialogVisable: false,
      suppliersDialogOptionColumn: supplierSelectDialog.option.column,
      currentDetailItem: {}, // 当前选中物料行
      currentDetailItemSelected: [], // 当前选中物料行已有供应商 toElsAccount,
      timeHistory: [],
      quoteEndTimeChange: null,
      currentEnquiryNumber: '',
      requestTypeDict: [],
      configurations: {},
      interval: null
    };
  },
  async created() {
    this.isAudit = this.$route.query.isAudit || false;
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.currentEnquiryNumber = this.$route.params.enquiryNumber;
    await this.tableData();
  },
  watch: {
    detailObj(newVal) {
      this.quoteEndTimeChange = newVal.quoteEndTime;
      if (
        !validatenull(this.quoteEndTimeChange) &&
        this.quoteEndTimeChange < new Date().getTime()
      ) {
        const index = this.headerButtons.findIndex((item) => item.text === '发布新供应商');
        if (index !== -1) {
          this.headerButtons.splice(index, 1);
        }
      }
      if (!validatenull(newVal.enquiryType) && this.configurations[newVal.enquiryType]) {
        this.handleEnquiryTypeChange(newVal.enquiryType);
      }
    },
    'detailObj.auditStatus'(newVal) {
      if (newVal === '1') {
        this.tabOption.option.column = [
          { label: '询价明细', prop: 'detail' },
          { label: '采购方文件', prop: 'files' },
          { label: '供货方文件', prop: 'filesSupplier' },
          { label: '询价规则', prop: 'rules' }
        ];
      } else {
        this.tabOption.option.column = [
          { label: '询价明细', prop: 'detail' },
          { label: '采购方文件', prop: 'files' },
          { label: '供货方文件', prop: 'filesSupplier' },
          { label: '审批记录', prop: 'auditHistory' },
          { label: '询价规则', prop: 'rules' }
        ];
      }
      this.$forceUpdate();
    }
  },
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
          let field = [];
          Object.keys(json.fieldJson.purchase).forEach((item) => {
            if (json.fieldJson.purchase[item].display) {
              field.push({
                prop: item,
                ...json.fieldJson.purchase[item]
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
      // 供应商列表 supplierMasterListAction
      supplierMasterListAction({ elsAccount: this.elsAccount, pageSize: 10000 }).then((res) => {
        this.supplierList = res.data.pageData.rows;
        this.suppliersDialogOptionColumn.data = this.supplierList.map((item, index) => {
          return {
            label: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`,
            key: item.toElsAccount,
            id: item.toElsAccount
          };
        });
      });
      this.initDetail();
    },
    initColumns() {
      this.formOption.column = [
        { label: '询价单号', span: 6, prop: 'enquiryNumber', disabled: true },
        { label: '询价名称', span: 6, prop: 'enquiryDesc', disabled: true },
        {
          type: 'select',
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
          formslot: true,
          type: 'datetime',
          display: true,
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'timestamp',
          label: '报价截止时间',
          span: 6,
          prop: 'quoteEndTime',
          rules: [{ required: true, message: '请选择报价截止时间', trigger: 'blur' }]
        },
        { label: '负责人', span: 6, prop: 'createUser', disabled: true }
      ];
      this.inquiryListOption.option.column = [
        { label: '物料编号', prop: 'materialNumber', slot: true, width: 150 },
        { label: '物料名称', prop: 'materialName' },
        { label: '物料描述', prop: 'materialDesc' },
        { label: '单位', prop: 'baseUnit', span: 4 },
        { label: '需求数量', prop: 'quantity' },
        { slot: true, label: '报价方式', prop: 'quoteMethod' },
        { slot: true, label: '阶梯信息', prop: 'quoteMethodInfo' },
        { slot: true, label: '成本模板', prop: 'costTemplate' },
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
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '交货日期',
          prop: 'deliveryDate'
        },
        { slot: true, label: '操作', prop: 'option' }
      ];
      // this.templateRule.enquiryIsQuota = false; // 测试是否配额 否
      // this.templateRule.enquiryIsQuota = 'number'; // 测试配额方式
      if (this.templateRule.enquiryIsQuota === true)
        this.inquiryListOption.option.column.push({ label: '配额', prop: 'quota', cell: true });
    },
    handleEnquiryTypeChange(value) {
      this.initColumns();
      if (this.configurations[value]) {
        const current = this.configurations[value].tableColumns.map((item) => {
          let result = {};
          result.prop = item.prop;
          result.label = item.label;
          result.display = item.purchaseShow;
          result.span = item.span;
          return result;
        });
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
      }
    },
    getPriceIndex(row, column) {
      if (
        row.itemStatus === '1' ||
        row.itemStatus === '3' ||
        validatenull(JSON.parse(row.ladderPriceJson))
      ) {
        return '';
      }
      const quantity = row.quantity;
      const quantityList = row.ladderPriceJson
        ? JSON.parse(row.ladderPriceJson).map((item) => {
            return Number(item.ladderQuantity);
          })
        : [];
      quantityList.push(quantity);
      const index = quantityList.findIndex((item) => item === Number(quantity));
      return JSON.parse(row.ladderPriceJson)[index - 1][column];
    },
    getCostPriceIndex(row, column) {
      if (row.itemStatus === '1' || row.itemStatus === '3') {
        return '';
      }
      const costJson = JSON.parse(row.costConstituteJson);
      console.log(row.toElsAccount, costJson);
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
        console.log(row.toElsAccount, price);
        return price || '';
      }
      return '';
    },
    cellStyle() {
      return {
        borderRight: 'none !important'
      };
    },
    cHeaderStyle() {
      return 'none-border-right';
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
    handleAgainQuote(row) {
      this.$confirm('确定要该供应商物料重报价（请更新报价截止时间）？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          enquiryNumber: this.detailObj.enquiryNumber,
          itemList: [this.inquiryListOption.data[row.$index]]
        };
        purchaseEnquiryAction('againQuote', params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('重报价成功');
          this.$router.go(0);
        });
      });
    },
    handleBack() {
      clearInterval(this.interval);
      this.$router.push({ path: '/list' });
    },
    handleBidPrice() {
      this.$router.push({ path: `/price/${this.currentEnquiryNumber}` });
    },
    handleClose() {
      this.$confirm('是否关闭？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          ...this.detailObj,
          itemList: this.inquiryListOption.data
        };
        purchaseEnquiryAction('close', params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('提交成功');
        });
      });
    },
    handleDetailItemClick(row, event, column) {
      this.currentDetailItemSelected = this.inquiryListOption.data
        .filter((item) => item.materialNumber === row.materialNumber)
        .map((item) => {
          return {
            id: item.toElsAccount,
            label: `${item.toElsAccount}_${item.companyShortName}_${item.supplierType}`
          };
        });
      this.currentDetailItem = {
        ...row,
        selectedSupplier: this.currentDetailItemSelected
      };
    },
    handleNewSupplier() {
      if (new Date().getTime() > this.detailObj.quoteEndTime) {
        this.$message.error('报价已截止');
        this.$router.go(0);
        return;
      }
      this.$confirm('是否发布新供应商？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const itemList = this.inquiryListOption.data.map((item) => {
          if (item.quoteMethod === '1') {
            if (validatenull(item.ladderPriceJson)) {
              const filterList = this.inquiryListOption.data.filter(
                (i) => i.materialNumber === item.materialNumber && !validatenull(i.ladderPriceJson)
              );
              item.ladderPriceJson = filterList[0].ladderPriceJson;
            }
          }

          const index = this.suppliersDialogOptionColumn.data.findIndex(
            (supplier) => supplier.label.indexOf(item.toElsAccount) !== -1
          );
          const supplier = this.suppliersDialogOptionColumn.data[index].label.split('_');
          return {
            toElsAccount: `${supplier[0]}_${supplier[1]}_${supplier[2] || ''}`,
            ...item,
            itemStatus: '1'
          };
        });
        const params = {
          ...formOption.detailObj,
          enquiryNumber: this.currentEnquiryNumber,
          quoteEndTime: this.detailObj.quoteEndTime,
          itemList: itemList
        };
        purchaseEnquiryAction('newSupplierPublish', params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('新供应商发布成功');
        });
      });
    },
    handleQuoteEndTime(value) {
      this.quoteEndTimeChange = value;
    },
    handleRadioChange(value, scope) {
      this.inquiryListOption.data[scope.row.$index].itemStatusCopy = value;
      if (value === '5') {
        this.inquiryListOption.data[scope.row.$index].quota = '';
        this.inquiryListOption.data[scope.row.$index].$cellEdit = false;
      } else {
        this.inquiryListOption.data[scope.row.$index].$cellEdit = true;
      }
    },
    handleShowHistory() {
      queryDetailAction('queryQuote', this.currentEnquiryNumber).then((res) => {
        this.historyList = res.data.pageData.rows;
        this.historyVisible = true;
      });
    },
    // 开启
    handleShowOpen() {
      this.openDialogVisible = true;
    },
    handleShowTimeHistory() {
      queryDetailAction('queryUpdateQuoteEndTime', this.currentEnquiryNumber).then((res) => {
        this.timeHistory = res.data.pageData.rows;
      });
    },
    handleOpenSubmit(form) {
      // this.detailObj.quoteEndTime = new Date().getTime();
      openPassWord({ enquiryNumber: this.detailObj.enquiryNumber, passWord: form.password }).then(
        (res) => {
          if (res.data.statusCode === '200') {
            this.openDialogVisible = false;
            this.$router.go(0);
          } else {
            this.$message.warning('请输入正确开启密码');
          }
        }
      );
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
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
    handleShowSupplierSelect() {
      if (validatenull(this.currentDetailItem)) {
        this.$message.warning('请选择物料');
        return;
      }
      this.suppliersDialogVisable = true;
    },
    handleCancelApproval() {
      this.$confirm('是否撤回审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        cancelAudit('cancel', {
          rootProcessInstanceId: this.detailObj.flowCode,
          businessId: this.detailObj.enquiryNumber,
          businessType: 'bargainEnquiryAudit'
        }).then((res) => {
          if (res.data.statusCode === '200') {
            this.$message.success('已撤回审批');
            this.$router.go(0);
            return;
          }
          this.$message.error('撤回审批失败');
        });
      });
    },
    handleClickMaterial(scope) {
      const router = {
        name: `物料详情(${scope.row.materialNumber})`,
        src: `/masterdata/material/#/view/${scope.row.materialNumber}_${scope.row.factory}`
      };
      const event = {
        name: 'openNewTag',
        props: router
      };
      window.parent.postMessage(event, '*');
    },
    handleSave() {
      this.inquiryListOption.data = this.inquiryListOption.data.map((item) => {
        return {
          ...item,
          itemStatus: item.itemStatusCopy
        };
      });
      const param = {
        ...this.detailObj,
        enquiryNumber: this.currentEnquiryNumber,
        elsAccount: this.elsAccount,
        quoteEndTime: this.detailObj.quoteEndTime,
        enquiryType: this.detailObj.enquiryType,
        enquiryDesc: this.detailObj.enquiryDesc,
        companyCode: this.detailObj.companyCode,
        enquiryMethod: this.detailObj.enquiryMethod || '',
        itemList: this.inquiryListOption.data
      };
      purchaseEnquiryAction('acceptOrRefuse', param).then((res) => {
        if (res.data.statusCode === '200') {
          this.$message.success('保存成功');
          this.$router.go(0);
        } else {
          this.$message.error(res.data.message);
        }
      });
    },
    handleSubmitApproval() {
      let status = true;
      let result = false;
      this.inquiryListOption.data = this.inquiryListOption.data.map((item) => {
        return {
          ...item,
          itemStatus: item.itemStatusCopy
        };
      });
      this.inquiryListOption.data.forEach((item) => {
        if (item.itemStatus === '4') {
          // 必须有接受的报价才能够提交审批
          status = false;
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
          // 相同物料 已报价 分配的配额必须相加为100（且 规则为配额是）
          if (
            Number(quote) !== 100 &&
            this.templateRule.enquiryIsQuota === true &&
            this.templateRule.enquiryQuotaType !== 'number'
          ) {
            result = true;
          } else if (
            Number(quote) !== Number(item.quantity) &&
            this.templateRule.enquiryIsQuota === true &&
            this.templateRule.enquiryQuotaType === 'number'
          ) {
            result = true;
          }
        }
      });
      if (status) {
        this.$message.error('必须有接受状态的报价才能够提交审批');
        return;
      }
      if (result) {
        this.$message.error(
          `物料配额必须等于${
            this.templateRule.enquiryQuotaType === 'percentage' ? '100' : '需求数量'
          }`
        );
        return;
      }
      this.$confirm('是否提交审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const action = 'submit';
        const param = {
          ...this.detailObj,
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
    handleUpdateQuoteEndTime() {
      if (this.quoteEndTimeChange < new Date().getTime()) {
        this.$message.error('截止时间不得小于当前时间');
        return;
      }
      this.$confirm('是否更新截止时间？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          ...this.detailObj,
          quoteEndTime: this.quoteEndTimeChange
        };
        purchaseEnquiryAction('updateQuoteEndTime', params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('更新截止时间成功');
          this.$router.go(0);
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
    checkQuoteEndTime() {
      if (this.detailObj.quoteEndTime > new Date().getTime()) {
        this.interval = setInterval(() => {
          if (this.detailObj.quoteEndTime < new Date().getTime()) {
            clearInterval(this.interval);
            this.$router.go(0);
          }
        }, 5000);
      }
    },
    initDetail() {
      this.detailObj = {};
      this.inquiryListOption.data = [];
      queryDetailAction('findHeadDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.detailObj = res.data.data;
        this.templateRule = this.configurations[this.detailObj.enquiryType]
          ? this.configurations[this.detailObj.enquiryType].rule
          : {};
        this.checkQuoteEndTime();
        if (this.detailObj.auditStatus === '0' || this.detailObj.auditStatus === '2') {
          this.inquiryListOption.option.header = false;
          this.headerButtons = [
            { power: true, text: '返回', type: '', size: '', action: 'on-back' },
            { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' }
          ];
          if (this.detailObj.auditStatus === '2') {
            this.headerButtons.push({
              power: true,
              text: '撤回',
              type: 'primary',
              size: '',
              action: 'on-cancel-approval'
            });
          }
        } else {
          this.headerButtons = [
            { power: true, text: '返回', type: '', size: '', action: 'on-back' },
            { power: true, text: '更新时间', type: 'primary', size: '', action: 'on-update-end' },
            {
              power: true,
              text: '保存',
              type: 'primary',
              size: '',
              action: 'on-save-approval'
            },
            {
              power: true,
              text: '提交审批',
              type: 'primary',
              size: '',
              action: 'on-submit-approval'
            },
            { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' },
            { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
            {
              power: true,
              text: '发布新供应商',
              type: 'primary',
              size: '',
              action: 'on-new-supplier'
            }
          ];
        }

        if (this.detailObj.quoteEndTime < new Date().getTime()) {
          this.inquiryListOption.option.header = false;
          this.headerButtons.push({
            power: true,
            text: '比价',
            type: 'primary',
            size: '',
            action: 'on-bid-price'
          });

          if (this.detailObj.canSeeRule === '1' && this.detailObj.showQuoteInfo !== 'Y') {
            this.headerButtons.push({
              power: true,
              text: '开启',
              type: 'primary',
              size: '',
              action: 'on-open'
            });
          }
        }

        if (res.data.data.flowCode) {
          let content = {
            flowId: res.data.data.flowCode,
            businessType: 'bargainEnquiryAudit',
            auditStatus: res.data.data.auditStatus
          };
          setStore({ name: this.currentEnquiryNumber, content, type: true });
          auditHisList({ rootProcessInstanceId: res.data.data.flowCode }).then((res) => {
            if (res.data.statusCode === '200') {
              this.auditListOption.data = res.data.pageData.rows;
            } else {
              this.auditListOption.data = [];
            }
          });
        }
      });
      queryDetailAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          return {
            id: item.uuid,
            // toElsAccountName: item.toElsAccount.split('_')[1],
            $cellEdit:
              item.itemStatus === '4' &&
              this.detailObj.auditStatus !== '0' &&
              this.detailObj.auditStatus !== '2',
            itemStatusCopy: item.itemStatus,
            ...item
          };
        });

        this.inquiryListOption.data = this.inquiryListOption.data.sort(compare('materialNumber'));
      });
    },
    sizeChange(val) {
      this.inquiryListOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      return mySpanMethod(
        this.inquiryListOption.data,
        [1, 2, 3, 4, 5, 6],
        'materialNumber',
        'id',
        columnIndex,
        row
      );
    },
    // 保存供应商选项
    suppliersDialogSaveTransfer(selectedSupplier) {
      const newSuppliers = selectedSupplier.filter(
        (item) => !this.currentDetailItemSelected.map((item) => item.id).includes(item)
      );
      const itemList = newSuppliers.map((item, index) => {
        const supplierIndex = this.suppliersDialogOptionColumn.data.findIndex(
          (supplier) => supplier.label.indexOf(item) !== -1
        );
        const supplier = this.suppliersDialogOptionColumn.data[supplierIndex].label.split('_');
        if (this.currentDetailItem.quoteMethod === '1') {
          if (validatenull(this.currentDetailItem.ladderPriceJson)) {
            const filterList = this.inquiryListOption.data.filter(
              (item) =>
                item.materialNumber === this.currentDetailItem.materialNumber &&
                !validatenull(item.ladderPriceJson)
            );
            this.currentDetailItem.ladderPriceJson = filterList[0].ladderPriceJson;
          }
        }
        let costJson = {};
        if (this.currentDetailItem.quoteMethod === '2') {
          costJson = JSON.parse(this.currentDetailItem.costConstituteJson);
          let template = costJson.templateJson;
          template = template.map((element) => {
            element.propData = { formData: {}, tableData: [] };
            return element;
          });
          costJson.templateJson = template;
          this.currentDetailItem.costConstituteJson = JSON.stringify(costJson);
        }
        return {
          id: `${index}`,
          materialNumber: this.currentDetailItem.materialNumber,
          materialName: this.currentDetailItem.materialName,
          materialDesc: this.currentDetailItem.materialDesc,
          materialSpecifications: this.currentDetailItem.materialSpecifications,
          baseUnit: this.currentDetailItem.baseUnit,
          deliveryDate: this.currentDetailItem.deliveryDate,
          quantity: this.currentDetailItem.quantity,
          elsAccount: this.currentDetailItem.elsAccount,
          toElsAccount: item,
          companyShortName: supplier[1],
          supplierName: supplier[1],
          supplierType: supplier[2],
          canDeliveryDate: this.currentDetailItem.canDeliveryDate,
          quoteMethod: this.currentDetailItem.quoteMethod,
          itemStatus: '1',
          taxCode: this.currentDetailItem.taxCode,
          taxRate: this.currentDetailItem.taxRate,
          priceIncludingTax: '',
          quota: '',
          ladderPriceJson: this.currentDetailItem.ladderPriceJson || null,
          costConstituteJson: this.currentDetailItem.costConstituteJson || null,
          $cellEdit: false
        };
      });
      this.inquiryListOption.data = this.inquiryListOption.data
        .concat(itemList)
        .sort(compare('materialNumber'));
    }
  }
};
</script>

<style>
.none-border-right {
  border-right: none !important;
}
</style>
