<template>
  <basic-container>
    <form-header
      showButton
      :buttons="headerButtons"
      :showHistoryButton="false"
      titleText="询价单"
      @on-open-flow-dialog="handleOpenFlowDialog"
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
          disabled
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
    <!-- 审批记录 -->
    <avue-crud
      v-show="tabActive === 'auditHistory'"
      :data="auditListOption.data"
      :option="auditListOption.option"
      :page.sync="auditListOption.page"
      v-model="auditListOption.obj"
    >
    </avue-crud>
    <!-- 表单文件 -->
    <fast2-attachment-list
      ref="attachment"
      :id="form.enquiryNumber"
      :elsAccount="elsAccount"
      :businessElsAccount="elsAccount"
      businessModule="enquiry"
      v-show="tabActive === 'files' && form.enquiryNumber"
      readonly
      :passClient="false"
      :client="false"
      :clientTab="false"
      version="attahcment-fiels_4_3"
    ></fast2-attachment-list>
    <avue-crud
      ref="itemList"
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
      <template slot="menuLeft" v-if="!purchaseRequest">
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
              v-if="!purchaseRequest"
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
      purchaseRequest
      :elsAccount="elsAccount"
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
import auditListOption from '@/const/rfq/newAndView/auditListOption';
import { getUserInfo } from '@/util/utils.js';
import { setStore } from '@/util/store.js';

import {
  cateService,
  orgList,
  dataDicAPI,
  supplierMasterListAction,
  accountListAction
} from '@/api/rfq/common';
import { purchaseEnquiryAction, queryDetailAction, auditHisList } from '@/api/rfq';
import { validatenull, validateNumber } from '@/util/validate';
import { testSuppliers } from '@/api/rfq/index';

import { ElsTemplateConfigService } from '@/api/templateConfig.js';
import { DIC } from '@/const/dic';

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
      templateRule: {},
      auditListOption: auditListOption,
      relation: {},
      selectedSupplier: [],
      data: {},
      elsAccount: '',
      elsSubAccount: '',
      headerButtons: [
        // {
        //   power: true,
        //   text: '审批节点',
        //   type: 'primary',
        //   size: '',
        //   action: 'on-open-flow-dialog'
        // }
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
    this.purchaseRequest = false;
    this.initColumns();
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
      this.formOption.disabled = true;
      this.inquiryListOption.option.menu = false;
      this.inquiryListOption.option.header = false;
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
    // handleOpenFlowDialog() {
    //   console.log('this.form.flowCode', this.form.flowCode);
    //   const event = {
    //     name: 'openFlowDialog',
    //     props: {
    //       flowId: this.form.flowCode
    //     }
    //   };
    //   window.parent.postMessage(event, '*');
    // },
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
          type: 'datetime',
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'timestamp',
          label: '提交截止时间',
          span: 6,
          prop: 'quoteEndTime',
          rules: [
            { required: true, message: '请选择提交截止时间', trigger: 'change' },
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
        { label: '供应商', prop: 'accountList' }
        // { slot: true, label: '报价方式', prop: 'quoteMethod' },
        // { slot: true, label: '阶梯信息', prop: 'quoteMethodInfo' },
        // { slot: true, label: '成本模板', prop: 'costTemplate' }
      ];
      this.inquiryListOption.option.column = baseColumn;
      this.dialogOption.column = [
        {
          type: 'tree',
          label: '物料编号',
          prop: 'materialNumber',
          formslot: true,
          disabled: this.purchaseRequest,
          rules: [{ required: true, message: '请选择物料编号' }]
        },
        {
          disabled: this.purchaseRequest,
          label: '需求数量',
          prop: 'quantity',
          rules: [
            { required: true, message: '请填写需求数量', trigger: 'blur' },
            { trigger: 'change', validator: validateQuantity }
          ]
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
        // {
        //   dicUrl: '/layout/dics/value/quoteMethod',
        //   dicMethod: 'get',
        //   type: 'select',
        //   label: '报价方式',
        //   prop: 'quoteMethod',
        //   rules: [{ required: true, message: '请选择报价方式', trigger: 'change' }]
        // },
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
        this.tabOption.option.column = [
          { label: '询价明细', prop: 'detail' },
          { label: '表单文件', prop: 'files' }
          // { label: '询价规则', prop: 'rules' }
        ];
        if (this.configurations[value].name === 'RFI') {
          this.inquiryListOption.option.column.splice(0, 5);
        }
        if (this.templateRule.enquiryIsProjectApproval === true && this.form.flowCode) {
          // this.tabOption.option.column.push({ label: '审批记录', prop: 'auditHistory' });
          auditHisList({
            rootProcessInstanceId: this.form.flowCode,
            businessId: this.form.enquiryNumber
          }).then((res) => {
            if (res.data.statusCode === '200') {
              this.auditListOption.data = res.data.pageData.rows;
            } else {
              this.auditListOption.data = [];
            }
          });
        }
        // 配置字段
        const current = this.configurations[value].tableColumns.map((item) => {
          let result = {};
          result.prop = item.prop;
          result.label = item.fbk1 || item.label;
          result.display = item.purchaseShow;
          result.span = item.span;
          result.type = item.type;
          result.dicData = item.dicData;
          result.dicUrl = item.dicUrl;
          result.dicMethod = item.dicMethod;
          result.valueFormat = 'timestamp';
          result.format = item.format;
          if (['materialDesc', 'materialName', 'materialSpecifications'].includes(item.prop)) {
            result.disabled = true;
          } else {
            result.disabled = !item.purchaseEdit;
          }
          return result;
        });
        current.forEach((item) => {
          if (
            this.inquiryListOption.option.column.filter((i) => i.prop === item.prop).length === 0
          ) {
            this.inquiryListOption.option.column.push({
              span: item.span || 6,
              ...item
            });
          }
          if (this.dialogOption.column.filter((i) => i.prop === item.prop).length === 0) {
            this.dialogOption.column.push({
              span: item.span || 6,
              ...item
            });
          }
        });
        // 头信息
        const fieldColumns = this.configurations[value].fieldColumns;
        fieldColumns.forEach((item) => {
          if (this.formOption.column.filter((i) => i.prop === item.prop).length === 0) {
            this.formOption.column.push({
              span: item.span || 6,
              ...item,
              label: item.fbk1 || item.label
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
            tableColumns: table, // 行信息
            buttons: json.buttonJson
          };
        }
        this.configurations = configurations;
      } else {
        this.requestTypeDict = [];
        this.$message.error('查找采购申请配置数据失败, ' + res.data.message || '');
      }
      // fbk3 品类
      cateService({ elsAccount: this.elsAccount, cateLevelCode: '1' }).then((res) => {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'fbk3' || item.label === '品类') {
            return {
              ...item,
              type: 'select',
              dicData: res.data.pageData.rows.map((item) => {
                return {
                  ...item,
                  value: item.cateCode,
                  label: item.cateName
                };
              })
            };
          }
          return item;
        });
      });
      // 组织列表（公司）
      orgList({ elsAccount: this.elsAccount, orgCategoryId: 'factory' }).then((res) => {
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
          if (item.prop === 'auditStatus') {
            return {
              ...item,
              type: 'select',
              dicData: [
                { value: '0', label: '通过' },
                { value: '2', label: '审批中' },
                { value: '3', label: '拒绝' }
              ]
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
          this.purchaseRequest = !validatenull(item.purchaseRequestNumber);

          this.dialogOption.column = this.dialogOption.column.map((item) => {
            if (
              [
                'materialNumber',
                'quantity',
                'materialDesc',
                'materialName',
                'materialSpecifications'
              ].includes(item.prop) &&
              this.purchaseRequest
            ) {
              item.disabled = true;
            }
            return item;
          });

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
      let item = {
        ...form,
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
      this.$refs.itemList.toggleSelection(false);
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
