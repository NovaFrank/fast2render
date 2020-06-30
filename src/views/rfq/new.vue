<template>
  <basic-container>
    <form-header
      titleText="新建询价单"
      showButton
      :buttons="headerButtons"
      @on-test="handleTest"
      @on-back="handleBack"
      @on-cancel="handleCancel"
      @on-close="handleClose"
      @on-delete="handleDelete"
      @on-release="handleRelease"
      @on-save="handleSaveForm"
      @on-audit-submit="handleSubmitAudit"
      @on-cancel-approval="handleCancelApproval"
    ></form-header>
    <avue-form ref="form" v-model="form" :option="formOption">
      <template slot="enquiryNumber">
        <span>{{ currentEnquiryNumber || '待生成' }}</span>
      </template>
      <template slot="enquiryType">
        <el-select
          v-model="form.enquiryType"
          @change="handleEnquiryTypeChange"
          filterable
          clearable
          placeholder="请选择 询价类型"
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
    <!-- 标准询价 -->
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
    <!-- 表单文件 -->
    <fast2-attachment-list
      ref="attachment"
      :id="form.enquiryNumber"
      :elsAccount="elsAccount"
      :businessElsAccount="elsAccount"
      businessModule="enquiry"
      v-show="tabActive === 'files' && form.enquiryNumber"
      :readonly="form.auditStatus === '2'"
      :passClient="false"
      :client="false"
      :clientTab="false"
      version="attahcment-fiels_4_3"
    ></fast2-attachment-list>
    <avue-crud
      v-show="tabActive === 'detail'"
      :data="inquiryListOption.data"
      :option="inquiryListOption.option"
      :page.sync="inquiryListOption.page"
      v-model="inquiryListOption.obj"
      @current-change="currentChange"
      @row-click="handleDetailItemClick"
      @size-change="sizeChange"
      @selection-change="handleMaterialSelectChange"
    >
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
      <template slot-scope="scope" slot="costTemplate">
        <span v-if="scope.row.quoteMethod === '2'">
          {{ JSON.parse(scope.row.costConstituteJson).templateName }}
        </span>
      </template>
      <template slot="menuLeft" v-if="validatenull(form.purchaseRequestNumber)">
        <el-button size="small" @click.stop="handleAddShow('添加', {})">添加行</el-button>
      </template>
      <template slot="menuLeft">
        <el-button size="small" @click.stop="handleShowSupplierSelect()">供应商</el-button>
      </template>
      <template slot-scope="scope" slot="menu">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-button
              class="el-button el-button--text el-button--small"
              @click.stop="handleAddShow('修改', scope.row)"
            >
              <i class="el-icon-edit"></i><span>编 辑</span>
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              v-if="validatenull(form.purchaseRequestNumber)"
              class="el-button el-button--text el-button--small"
              @click.stop="handleDeleteDetailItem(scope.row)"
            >
              <i class="el-icon-delete"></i><span>删 除</span>
            </el-button>
          </el-col>
        </el-row>
      </template>
    </avue-crud>
    <!-- 询价明细表单 -->
    <field-dialog
      :dialogTitle="dialogTitle"
      :dialogOption="dialogOption"
      :field="fieldDialogForm"
      :fieldDialogVisible="fieldDialogVisible"
      :dialogWidth="dialogWidth"
      :enquiryPurchaserTax="templateRule.enquiryPurchaserTax"
      @on-save-form="onSaveItemForm"
      @close-field-dialog="closeFieldDialog"
      @show-supplier-select="handleShowSupplierSelect"
    ></field-dialog>
    <select-supplier-dialog
      ref="suppliersDialog"
      :dialogVisible.sync="suppliersDialogVisable"
      :title="'供应商'"
      :data="suppliersDialogOptionColumn.data"
      :crudObj="currentDetailItem"
      @on-save="suppliersDialogSaveTransfer"
    ></select-supplier-dialog>
    <relation-dialog
      :dialogVisible.sync="relationDialogVisable"
      :leftData="selectedSupplier"
      :rightData="relation"
    ></relation-dialog>
  </basic-container>
</template>

<script>
import FormHeader from '@/components/views/formHeader';
import fieldDialog from '@/components/views/fieldDialog';
import fieldDialogOption from '@/const/rfq/newAndView/formDialog'; // 询价明细弹窗option
import formOption from '@/const/rfq/newAndView/form';
import tabOption from '@/const/rfq/newAndView/tabs';
import inquiryListOption from '@/const/rfq/newAndView/inquiryList';
import filesOption from '@/const/rfq/newAndView/files';
import supplierSelectDialog from '@/const/rfq/newAndView/supplierSelectDialog';
import relationDialog from './relationship/dialog';
import selectSupplierDialog from '@/components/views/selectSupplierDialog';
import { getUserInfo } from '@/util/utils.js';
import { setStore } from '@/util/store.js';

import {
  orgList,
  dataDicAPI,
  materialListAction,
  supplierMasterListAction,
  accountListAction
} from '@/api/rfq/common';
import { purchaseEnquiryAction, queryDetailAction, submitAudit, cancelAudit } from '@/api/rfq';
import { validatenull, validateNumber } from '@/util/validate';
import { testSuppliers } from '@/api/rfq/index';

import { ElsTemplateConfigService } from '@/api/templateConfig.js';
import { DIC } from '@/const/dic';

const validateDateTime = (rule, value, callback) => {
  if (value && value < new Date().getTime()) {
    callback(new Error('时间不得小于当前时间'));
  } else {
    callback();
  }
};

const validateQuantity = (rule, value, callback) => {
  if (!validateNumber(value)) {
    callback(new Error('请输入大于0的小数或整数'));
  } else {
    callback();
  }
};

export default {
  components: {
    FormHeader,
    fieldDialog,
    selectSupplierDialog,
    relationDialog
  },
  data() {
    return {
      templateRule: {
        // enquirySetRanking: true, 是否开启排名 - 在比价页面对比项中添加【排名】字段
        // enquiryIsQuota: true, 是否配额 是否现实配额列（是否判断）
        // enquiryQuotaType: 'percentage', 配额方式 百分比percentage/数量number
        // enquiryIsProjectApproval: true, 是否立项 发布前需要提交审批，审批通过 则可发布
        // enquiryPurchaserTax: true, 采购方税率/供方税率
        // isMin3Supplier: true, 最小三家供应商
        // enquiryPriceContrast: 'package', 比价 1打包比-package 2逐条比-item 3成本比-cost ： 成本比是否需要将成本含税价等传接口？
        // ============================================================================
        // enquiryIsOnlyQualifiedSupplier: true, 是否供应商资质审查 - 暂无
        // enquiryWay: 'partner', 询价方式（合作伙伴、企企通、已认证、潜在、陌生） - 暂无
        // ----------------------------------------------------------------------------
        // isViewAbleAttachmentBefroeDealline: true 报价时间截止前，是否可查看供方附件
        // ------------------- 不要 enquiryPriceQuote: 'normal', 报价方式
        // ------------------- 不要 enquirySetPassword: true, 是否使用开启密码 是否与头部开启冲突？
        // 公开原则 enquiryPublicRule 未知
        // enquiryViewHistory: 'ranking', 查看历史记录 price/ranking/supplier 仅历史记录列表加入供应商名
        // 询价范围？？？？？enquiryScope？？？？？？成本报价 true/false？？？？？ 合并到询价方式
      },
      relation: {},
      selectedSupplier: [],
      data: {},
      elsAccount: '',
      elsSubAccount: '',
      headerButtons: [
        // { power: true, text: '删除', type: 'primary', size: '', action: 'on-delete' },
        // { power: true, text: '退回', type: 'primary', size: '', action: 'on-back' },
        // { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
        // { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
        // { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
        { power: true, text: '返回', type: '', size: '', action: 'on-cancel' }
      ],
      formOption: formOption, // 表头 option
      tabOption: tabOption, // tab option
      inquiryListOption: inquiryListOption, // 询价明细（行信息）Option
      filesOption: filesOption,
      tabActive: 'detail',
      form: {},
      filesForm: {},
      materialList: [], // 询价明细 - 物料列表
      fieldDialogForm: {
        suppliers: [] // 询价明细 - 行信息
      },
      fieldDialogVisible: false,
      dialogTitle: '',
      dialogWidth: '70%',
      dialogOption: fieldDialogOption, // 询价明细 表单option
      // 供应商选择框
      suppliersDialogVisable: false,
      suppliersDialogOptionColumn: supplierSelectDialog.option.column,
      suppliersDialogData: supplierSelectDialog.data,
      suppliersDialogPage: supplierSelectDialog.page,
      suppliersDialogQueryParam: {},
      suppliersDialogPageParam: { pageNo: 1, pageSize: 10 },
      suppliersSelect: [],
      currentDetailItem: {}, // 当前选中物料行
      currentSelectionDetailItems: [],
      currentDetailItemSelected: [], // 当前选中物料行已有供应商 toElsAccount,
      relationDialogVisable: false,
      currentEnquiryNumber: '',
      requestTypeDict: [],
      configurations: []
    };
  },
  async created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.form = {};
    this.inquiryListOption.data = [];
    await this.tableData(); // 加载当前页面需要的数据
    if (!validatenull(this.$route.params.enquiryNumber)) {
      this.currentEnquiryNumber = this.$route.params.enquiryNumber;
      this.initDetail();
    } else {
      this.currentEnquiryNumber = '';
    }
  },
  watch: {
    form(newVal) {
      this.formOption.detail = newVal.auditStatus === '2';
      this.inquiryListOption.option.menu = newVal.auditStatus !== '2';
      this.inquiryListOption.option.header = newVal.auditStatus !== '2';
      if (newVal.auditStatus === '2') {
        this.headerButtons = [
          {
            power: true,
            text: '撤回',
            type: 'primary',
            size: '',
            action: 'on-cancel-approval'
          },
          { power: true, text: '返回', type: '', size: '', action: 'on-cancel' }
        ];
      } else {
        if (this.form.purchaseRequestNumber) {
          this.inquiryListOption.option.menu = true;
          this.headerButtons = [
            { power: true, text: '退回', type: 'primary', size: '', action: 'on-back' },
            { power: true, text: '风险检测', type: 'primary', size: '', action: 'on-test' },
            { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
            { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
            { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
            { power: true, text: '返回', type: '', size: '', action: 'on-cancel' }
          ];
        } else {
          this.inquiryListOption.option.menu = true;
          this.headerButtons = [
            { power: true, text: '风险检测', type: 'primary', size: '', action: 'on-test' },
            { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
            { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
            { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
            { power: true, text: '返回', type: '', size: '', action: 'on-cancel' }
          ];
        }
        if (newVal.enquiryNumber) {
          this.headerButtons.push({
            power: true,
            text: '删除',
            type: 'primary',
            size: '',
            action: 'on-delete'
          });
        }
      }
      if (!validatenull(newVal.enquiryType) && this.configurations[newVal.enquiryType]) {
        this.handleEnquiryTypeChange(newVal.enquiryType);
        this.templateRule = this.configurations[newVal.enquiryType].rule;
      }
      this.$forceUpdate();
    },
    'form.canSeeRule'(newVal) {
      if (newVal === '1') {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'passWord') {
            item.display = true;
            item.rules = [
              {
                required: true,
                message: '请填写开启密码',
                trigger: 'blur'
              }
            ];
            return item;
          }
          return item;
        });
      } else {
        this.form.passWord = '';
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'passWord') {
            item.display = false;
            item.rules = [];
            return item;
          }
          return item;
        });
      }
    }
  },
  methods: {
    initColumns() {
      const validateQuoteEndTime = (rule, value, callback) => {
        if (value && value < new Date().getTime()) {
          callback(new Error('截止时间不得小于当前时间'));
        } else {
          callback();
        }
      };
      // 基本字段
      this.formOption.column = [
        {
          formslot: true,
          type: 'input',
          label: '询价单号',
          span: 6,
          prop: 'enquiryNumber'
        },
        {
          type: 'input',
          label: '询价名称',
          span: 6,
          prop: 'enquiryDesc'
        },
        {
          type: 'tree',
          label: '公司代码',
          span: 6,
          prop: 'companyCode',
          valueDefault: ''
        },
        {
          type: 'datetime',
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'timestamp',
          label: '报价截止时间',
          span: 6,
          prop: 'quoteEndTime',
          rules: [
            { required: true, message: '请选择报价截止时间', trigger: 'change' },
            { trigger: 'change', validator: validateQuoteEndTime }
          ]
        },
        {
          type: 'select',
          formslot: true,
          label: '询价类型',
          span: 6,
          prop: 'enquiryType',
          rules: [{ required: true, message: '请选择询价类型', trigger: 'change' }]
        },
        {
          type: 'select',
          dicData: DIC.CHECK_RULE,
          label: '查看规则',
          span: 6,
          prop: 'canSeeRule',
          value: '0',
          rules: [{ required: true, message: '请选择查看规则', trigger: 'blur' }]
        },
        {
          type: 'input',
          label: '开启密码',
          span: 6,
          prop: 'passWord',
          display: false,
          maxlength: 8,
          showWordLimit: true
        }
      ];
      const baseColumn = [
        { label: '物料编号', prop: 'materialNumber', slot: true, width: 150 },
        { label: '物料名称', prop: 'materialName' },
        { label: '物料描述', prop: 'materialDesc' },
        { label: '单位', prop: 'baseUnit', span: 4 },
        { label: '需求数量', prop: 'quantity' },
        { label: '供应商', prop: 'accountList' },
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '要求交期',
          prop: 'deliveryDate'
        },
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '交货日期',
          prop: 'canDeliveryDate'
        },
        { slot: true, label: '报价方式', prop: 'quoteMethod' },
        { slot: true, label: '阶梯信息', prop: 'quoteMethodInfo' },
        { slot: true, label: '成本模板', prop: 'costTemplate' }
      ];
      this.inquiryListOption.option.column = baseColumn;
      this.dialogOption.column = [
        {
          type: 'tree',
          label: '物料编号',
          prop: 'materialNumber',
          disabled: !validatenull(this.form.purchaseRequestNumber),
          dicData: this.materialList.map((item) => {
            return {
              label: item.materialNumber,
              value: item.materialNumber
            };
          }),
          rules: [{ required: true, message: '请选择物料编号', trigger: 'blur' }]
        },
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '要求交期',
          prop: 'deliveryDate',
          rules: [{ trigger: 'change', validator: validateDateTime }]
        },
        {
          disabled: !validatenull(this.form.purchaseRequestNumber),
          label: '需求数量',
          prop: 'quantity',
          rules: [
            { required: true, message: '请填写需求数量', trigger: 'blur' },
            { trigger: 'change', validator: validateQuantity }
          ]
        },
        {
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'timestamp',
          label: '交货日期',
          prop: 'canDeliveryDate',
          rules: [{ trigger: 'change', validator: validateDateTime }]
        },
        {
          type: 'select',
          label: '税码',
          prop: 'taxCode',
          disabled: this.templateRule.enquiryPurchaserTax !== true,
          rules:
            this.templateRule.enquiryPurchaserTax === true
              ? [{ required: true, message: '请选择税码', trigger: 'blur' }]
              : []
        },
        {
          label: '税率',
          prop: 'taxRate',
          disabled: true
        },
        {
          dicUrl: '/layout/dics/value/currency',
          dicMethod: 'get',
          type: 'select',
          label: '币别',
          prop: 'currency'
        },
        {
          dicUrl: '/layout/dics/value/quoteMethod',
          dicMethod: 'get',
          type: 'select',
          label: '报价方式',
          prop: 'quoteMethod',
          rules: [{ required: true, message: '请选择报价方式', trigger: 'change' }]
        },
        {
          span: 24,
          formslot: true,
          label: '',
          prop: 'ladderPriceJson'
        }
      ];
    },
    handleEnquiryTypeChange(value) {
      if (this.configurations[value]) {
        this.templateRule = this.configurations[value].rule;
        this.initColumns();
        if (this.templateRule.enquiryIsProjectApproval === true && this.form.auditStatus !== '0') {
          this.headerButtons = this.headerButtons.map((item) => {
            if (item.action === 'on-release') {
              item.text = '提交审批';
              item.action = 'on-audit-submit';
            }
            return item;
          });
          console.log('this.headerButtons', this.headerButtons);
        }
        // 配置字段
        const current = this.configurations[value].tableColumns.map((item) => {
          let result = {};
          result.prop = item.prop;
          result.label = item.label;
          result.display = item.purchaseShow;
          result.span = item.span;
          result.type = item.type;
          result.dicData = item.dicData;
          result.dicUrl = item.dicUrl;
          result.dicMethod = item.dicMethod;
          return result;
        });
        this.inquiryListOption.option.column = this.inquiryListOption.option.column.concat(current);
        this.dialogOption.column = this.dialogOption.column.concat(current);
        const fieldColumns = this.configurations[value].fieldColumns;
        fieldColumns.forEach((item) => {
          if (this.formOption.column.filter((i) => i.prop === item.prop).length === 0) {
            this.formOption.column.push({
              span: item.span || 6,
              ...item
            });
          }
        });
      } else {
        this.initColumns();
      }
      this.tableData();
    },
    handleAddShow(title, row) {
      this.fieldDialogForm = title === '添加' ? {} : row;
      this.dialogTitle = `${title}询价明细`;
      this.fieldDialogVisible = true;
      this.$nextTick(() => {
        if (this.$refs.formField) this.$refs.formField.resetFields(); // 等弹窗里的form表单的dom渲染完在执行this.$refs.staffForm.resetFields()，去除验证
      });
    },
    async tableData(data) {
      const res = await ElsTemplateConfigService.find({
        elsAccount: this.elsAccount,
        businessModule: 'enquiry',
        currentVersionFlag: 'Y'
      });
      this.requestTypeDict = [];
      const configurations = [];

      if (res.data && res.data.statusCode === '200' && res.data.pageData) {
        const rows = res.data.pageData.rows || [];
        for (const item of rows) {
          const json = JSON.parse(item.configJson);
          // console.log('json', json);
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
      } else {
        this.requestTypeDict = [];
        this.$message.error('查找采购申请配置数据失败, ' + res.data.message || '');
      }
      // 组织列表（公司）
      orgList().then((res) => {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'companyCode') {
            return {
              ...item,
              dicData: res.data.pageData.rows.map((item) => {
                return {
                  ...item,
                  value: item.orgId,
                  label: item.orgId
                };
              })
            };
          }
          return item;
        });
      });
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
      // 负责人 accountListAction
      accountListAction({ elsAccount: this.elsAccount }).then((res) => {
        this.accountList = res.data.pageData.rows;
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'responsible') {
            return {
              dicData: this.accountList.map((item) => {
                return {
                  label: `${item.elsAccount}_${item.name}`,
                  value: `${item.elsAccount}_${item.name}`
                };
              }),
              ...item
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
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'toElsAccountList') {
            return {
              dicData: this.supplierList.map((item) => {
                return {
                  label: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`,
                  value: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`
                };
              }),
              ...item
            };
          }
          return item;
        });
      });
      // 物料列表
      materialListAction({ elsAccount: this.elsAccount }).then((res) => {
        this.materialList = res.data.pageData.rows;
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'materialNumber') {
            return {
              dicData: this.materialList.map((item) => {
                return {
                  label: item.materialNumber,
                  value: item.materialNumber
                };
              }),
              ...item
            };
          }
          return item;
        });
      });
      // 税率
      dataDicAPI('taxRate').then((res) => {
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'taxCode') {
            return {
              ...item,
              dicData: res.data.map((item) => {
                return {
                  label: `${item.value}`,
                  value: `${item.label}_${item.value}`
                };
              })
            };
          }
          return item;
        });
      });
    },
    closeFieldDialog() {
      this.fieldDialogVisible = false;
    },
    currentChange(val) {
      this.inquiryListOption.page.currentPage = val;
      this.tableData({
        currentPage: val,
        pageSize: this.inquiryListOption.page.pageSize
      });
    },
    handleClose() {
      this.$confirm('是否关闭？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          ...this.form,
          itemList: this.inquiryListOption.data
        };
        purchaseEnquiryAction('close', params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('关闭成功');
        });
      });
    },
    handleBack() {
      this.$confirm('是否退回？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        queryDetailAction('goBack', this.currentEnquiryNumber).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('退回成功');
        });
      });
    },
    handleCancel() {
      this.$router.push({ path: '/list' });
    },
    handleDelete(row) {
      this.$confirm('确定删除？', '提示').then(() => {
        queryDetailAction('delete', this.currentEnquiryNumber).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('删除成功');
          this.$router.go(-1);
        });
      });
    },
    handleDeleteDetailItem(row) {
      this.inquiryListOption.data.splice(row.$index, 1);
    },
    handleDetailItemClick(row, event, column) {
      this.currentDetailItemSelected = validatenull(row.toElsAccountList)
        ? []
        : row.toElsAccountList.split(',').map((item) => {
            const i = item.split('_');
            return {
              id: i[0],
              label: `${i[0]}_${i[1]}_${i[2]}`
            };
          });
      this.currentDetailItem = {
        ...row,
        selectedSupplier: this.currentDetailItemSelected
      };
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
    handleMaterialSelectChange(selection) {
      this.currentSelectionDetailItems = selection;
    },
    // 发布/提交审批
    handleRelease() {
      if (this.templateRule.isMin3Supplier === true) {
        let result = false;
        this.inquiryListOption.data.forEach((item) => {
          if (item.toElsAccountList.split(',').length < 3) result = true;
        });
        if (result) {
          this.$message.error('每个物料至少选择 3 个供应商参与报价');
          return;
        }
      }
      if (this.inquiryListOption.data.length === 0) {
        this.$message.error('请添加询价明细');
        return;
      }
      if (this.templateRule.enquiryPurchaserTax === true) {
        let validate = this.inquiryListOption.data.filter(
          (item) => validatenull(item.quoteMethod) || validatenull(item.taxRate)
        );
        if (validate.length > 0) {
          this.$message.error('请完善报价方式或税码/税率');
          return;
        }
      } else if (this.templateRule.enquiryPurchaserTax !== true) {
        let validate = this.inquiryListOption.data.filter((item) => validatenull(item.quoteMethod));
        if (validate.length > 0) {
          this.$message.error('请完善报价方式');
          return;
        }
      }
      this.$confirm('是否发布？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.attachment
          .sendFiles()
          .then((res) => {
            if (!res.result) {
              this.$message.error(res.message || '附件发送失败');
              return;
            }
            this.$refs.form.validate((valid) => {
              if (valid) {
                const itemList = this.inquiryListOption.data.map((item) => {
                  const index = this.materialList.findIndex(
                    (m) => m.materialNumber === item.materialNumber
                  );
                  item.queryUuid = this.materialList[index].uuid;
                  return item;
                });
                let params = {
                  ...this.form,
                  enquiryNumber: this.currentEnquiryNumber,
                  elsAccount: this.elsAccount,
                  quoteEndTime: this.form.quoteEndTime,
                  enquiryType: this.form.enquiryType,
                  enquiryDesc: this.form.enquiryDesc,
                  companyCode: this.form.companyCode,
                  enquiryMethod: this.form.enquiryMethod,
                  canSeeRule: this.form.canSeeRule,
                  passWord: this.form.passWord,
                  auditStatus: this.form.auditStatus,
                  itemList
                };
                if (this.currentEnquiryNumber) {
                  params = {
                    ...params,
                    enquiryNumber: this.currentEnquiryNumber
                  };
                }
                purchaseEnquiryAction('publishEnquiry', params).then((res) => {
                  if (res.data.statusCode !== '200') {
                    this.$message.error(res.data.message);
                    return;
                  }
                  this.$message.success('发布成功');
                  this.$router.push({ path: '/list' });
                });
              }
            });
          })
          .catch((res) => {
            this.$message.error(res.message || '发布失败，请检查附件');
          });
      });
    },
    // 是否立项 - 撤回
    handleCancelApproval() {
      this.$confirm('是否撤回审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        cancelAudit('cancel', {
          rootProcessInstanceId: this.form.flowCode,
          businessId: this.form.enquiryNumber,
          businessType: 'editEnquiryAudit'
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
    // 是否立项 - 提交审批
    handleSubmitAudit() {
      if (validatenull(this.currentEnquiryNumber)) {
        this.$message.error('请保存后提交立项审批');
        return;
      }
      this.$confirm('是否提交审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.attachment
          .sendFiles()
          .then((res) => {
            if (!res.result) {
              this.$message.error(res.message || '附件发送失败');
              return;
            }
            this.$refs.form.validate((valid) => {
              if (valid) {
                if (this.inquiryListOption.data.length === 0) {
                  this.$message.error('请添加询价明细');
                  return;
                }
                if (this.templateRule.enquiryPurchaserTax === true) {
                  let validate = this.inquiryListOption.data.filter(
                    (item) => validatenull(item.quoteMethod) || validatenull(item.taxRate)
                  );
                  if (validate.length > 0) {
                    this.$message.error('请完善报价方式或税码/税率');
                    return;
                  }
                } else if (this.templateRule.enquiryPurchaserTax !== true) {
                  let validate = this.inquiryListOption.data.filter((item) =>
                    validatenull(item.quoteMethod)
                  );
                  if (validate.length > 0) {
                    this.$message.error('请完善报价方式');
                    return;
                  }
                }

                const action = 'submit';
                const itemList = this.inquiryListOption.data.map((item) => {
                  const index = this.materialList.findIndex(
                    (m) => m.materialNumber === item.materialNumber
                  );
                  item.queryUuid = this.materialList[index].uuid;
                  return item;
                });
                const param = {
                  ...this.form,
                  enquiryNumber: this.currentEnquiryNumber,
                  elsAccount: this.elsAccount,
                  quoteEndTime: this.form.quoteEndTime,
                  enquiryType: this.form.enquiryType,
                  enquiryDesc: this.form.enquiryDesc,
                  companyCode: this.form.companyCode,
                  enquiryMethod: this.form.enquiryMethod || '',
                  itemList
                };
                let params = {
                  elsAccount: this.form.elsAccount,
                  // toElsAccount: this.detailObj.toElsAccount,
                  businessType: 'editEnquiryAudit',
                  businessId: this.form.enquiryNumber,
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
              }
            });
          })
          .catch((res) => {
            this.$message.error(res.message || '发布失败，请检查附件');
          });
      });
    },
    // 保存
    handleSaveForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$confirm('是否保存？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.inquiryListOption.data.length === 0) {
              this.$message.error('请添加询价明细');
              return;
            }
            if (this.templateRule.enquiryPurchaserTax === true) {
              let validate = this.inquiryListOption.data.filter(
                (item) => validatenull(item.quoteMethod) || validatenull(item.taxRate)
              );
              if (validate.length > 0) {
                this.$message.error('请完善报价方式或税码/税率');
                return;
              }
            } else if (this.templateRule.enquiryPurchaserTax !== true) {
              let validate = this.inquiryListOption.data.filter((item) =>
                validatenull(item.quoteMethod)
              );
              if (validate.length > 0) {
                this.$message.error('请完善报价方式');
                return;
              }
            }
            const itemList = this.inquiryListOption.data.map((item) => {
              const index = this.materialList.findIndex(
                (m) => m.materialNumber === item.materialNumber
              );
              item.queryUuid = this.materialList[index].uuid;
              return item;
            });
            const params = {
              ...this.form,
              enquiryNumber: this.currentEnquiryNumber,
              elsAccount: this.elsAccount,
              quoteEndTime: this.form.quoteEndTime,
              enquiryType: this.form.enquiryType,
              enquiryDesc: this.form.enquiryDesc,
              companyCode: this.form.companyCode,
              enquiryMethod: this.form.enquiryMethod,
              canSeeRule: this.form.canSeeRule,
              passWord: this.form.passWord,
              itemList
            };
            purchaseEnquiryAction('save', params).then((res) => {
              if (res.data.statusCode !== '200') {
                this.$message.error(res.data.message);
                return;
              }
              this.$message.success('保存成功');
              if (this.currentEnquiryNumber) {
                // this.$router.go(0);
                return;
              }
              const enquiryNumber = res.data.data.enquiryNumber;
              this.currentEnquiryNumber = enquiryNumber;
              this.$forceUpdate();
              this.form.enquiryNumber = enquiryNumber;
              this.$router.push({ path: `/new/${enquiryNumber}`, query: { enquiryNumber } });
            });
          });
        }
      });
    },
    handleShowSupplierSelect() {
      if (!validatenull(this.currentDetailItem) || this.currentSelectionDetailItems.length > 0) {
        this.suppliersDialogVisable = true;
        return;
      }
      this.$message.warning('请选择询价明细');
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    initDetailError(res) {
      if (res.data.statusCode !== '200') {
        this.$message.error(res.data.message || '请求失败');
        return false;
      }
      return true;
    },
    initDetail() {
      queryDetailAction('findHeadDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.form = res.data.data;

        if (res.data.data.flowCode) {
          let content = {
            flowId: res.data.data.flowCode,
            businessType: 'editEnquiryAudit',
            auditStatus: res.data.data.auditStatus
          };
          setStore({ name: this.currentEnquiryNumber, content, type: true });
        }
      });
      queryDetailAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          const accountList = item.toElsAccountList
            ? item.toElsAccountList
                .split(',')
                .map((i) => {
                  return i.split('_')[1];
                })
                .toString()
            : '';
          item.accountList = accountList;
          return item;
        });
      });
      this.$forceUpdate();
    },
    // 明细行信息保存
    onSaveItemForm(form) {
      if (
        this.dialogTitle === '添加询价明细' &&
        this.inquiryListOption.data.filter((item) => item.materialNumber === form.materialNumber)
          .length > 0
      ) {
        this.$message.error('物料编号不可重复');
        return;
      }
      const materialIndex = this.materialList.findIndex(
        (item) => item.materialNumber === form.materialNumber
      );
      const currentMaterial = this.materialList[materialIndex];
      let item = {
        ...form,
        materialNumber: currentMaterial.materialNumber,
        materialName: currentMaterial.materialName,
        materialDesc: currentMaterial.materialDesc,
        materialSpecifications: currentMaterial.materialSpecifications,
        baseUnit: currentMaterial.baseUnit,
        deliveryDate: form.deliveryDate,
        quantity: form.quantity,
        taxCode: form.taxCode,
        taxRate: form.taxRate,
        currency: form.currency,
        elsAccount: form.elsAccount,
        canDeliveryDate: form.canDeliveryDate,
        toElsAccountList: form.toElsAccountList ? form.toElsAccountList.toString() : '',
        quoteMethod: form.quoteMethod // 0、1
      };
      // if (form.quoteMethod === '1') {
      //   item = {
      //     ...item,
      //     ladderPriceJson: JSON.stringify(
      //       form.ladderPriceJson.map((item) => {
      //         return {
      //           ladderQuantity: item.ladderQuantity,
      //           ladderGrade: item.ladderGrade
      //         };
      //       })
      //     )
      //   };
      // }

      if (form.ladderPriceJson) {
        item = {
          ...item,
          ladderPriceJson: JSON.stringify(
            form.ladderPriceJson.map((item) => {
              return {
                ladderQuantity: item.ladderQuantity,
                ladderGrade: item.ladderGrade
              };
            })
          )
        };
      }
      if (this.dialogTitle === '添加询价明细') {
        this.inquiryListOption.data.push(item);
      } else if (this.dialogTitle === '修改询价明细') {
        this.inquiryListOption.data.splice(form.$index, 1, item);
      }
      this.fieldDialogVisible = false;
      this.$message.success('保存成功');
    },
    sizeChange(val) {
      this.inquiryListOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    suppliersDialogSave(selectItems) {
      selectItems.forEach((item) => {
        let isExist = false;
        let newSupplier = {
          elsCount: item.elsCount,
          supplierName: item.supplierName,
          $cellEdit: true
        };
        this.fieldDialogForm.suppliers.forEach((supplier) => {
          if (supplier.elsCount === newSupplier.elsCount) {
            isExist = true;
          }
        });
        if (!isExist) {
          this.fieldDialogForm.suppliers.push(newSupplier);
        }
      });
    },
    showRelationDialog(selectedSupplier, relation) {
      this.selectedSupplier = selectedSupplier;
      this.relation = relation;
      this.relationDialogVisable = true;
    },
    suppliersDialogSaveTransfer(selectedSupplier) {
      selectedSupplier = this.suppliersDialogOptionColumn.data
        .filter((item) => selectedSupplier.includes(item.key))
        .map((item) => item.label);
      if (this.currentSelectionDetailItems.length > 0) {
        this.currentSelectionDetailItems.forEach((item) => {
          const index = item.$index;
          const suppliers = selectedSupplier.map((i) => {
            return i.split('_')[1];
          });
          this.$set(
            this.inquiryListOption.data[index],
            'toElsAccountList',
            selectedSupplier.toString()
          );
          this.$set(this.inquiryListOption.data[index], 'accountList', suppliers.toString());
        });
      } else {
        const index = this.currentDetailItem.$index;
        this.$set(
          this.inquiryListOption.data[index],
          'toElsAccountList',
          selectedSupplier.toString()
        );
        const suppliers = selectedSupplier.map((i) => {
          console.log(i.split('_'));
          return i.split('_')[1];
        });
        this.$set(this.inquiryListOption.data[index], 'accountList', suppliers.toString());
      }
      this.currentDetailItem = {};
      this.currentSelectionDetailItems = [];
    },
    handleTest() {
      let selectSuppliers = [];
      this.inquiryListOption.data.forEach((item) => {
        if (item.toElsAccountList) {
          item.toElsAccountList.split(',').forEach((i) => {
            selectSuppliers.push(i.split('_')[1]);
          });
        }
      });
      if (selectSuppliers.length > 0) {
        testSuppliers(selectSuppliers)
          .then((res) => {
            if (res.data.statusCode === '200') {
              this.showRelationDialog(
                selectSuppliers,
                res.data.data.data['companyRelationshipVOS']
              );
            } else {
              this.$message.error('查询失败' || res.data.message);
            }
          })
          .catch((res) => {
            this.$message.error('查询失败');
          });
      } else {
        this.$message.error('请选择供应商');
      }
    }
  }
};
</script>
