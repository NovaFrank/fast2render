<template>
  <basic-container>
    <form-header
      titleText="新建/编辑询价单"
      showButton
      :buttons="buttons"
      @on-test="handleTest"
      @on-back="handleBack"
      @on-cancel="handleCancel"
      @on-close="handleClose"
      @on-delete="handleDelete"
      @on-release="handleRelease"
      @on-save="handleSaveForm"
      @on-audit-submit="handleSubmitAudit"
      @on-cancel-approval="handleCancelApproval"
      @on-open-flow-dialog="handleOpenFlowDialog"
    ></form-header>
    <avue-form ref="form" v-model="form" :option="formOption">
      <template slot="enquiryNumber">
        <span>{{ currentEnquiryNumber || '待生成' }}</span>
      </template>
      <template slot="enquiryType">
        <el-select
          :disabled="form.auditStatus === '2' || form.auditStatus === '0'"
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
      :readonly="form.auditStatus === '2' || form.auditStatus === '0'"
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
            style="margin: 0;"
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
      :purchaseRequest="purchaseRequest"
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
      @supplier-page-data="getSupplierPageData"
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
  accountListAction,
  uploadServlet,
  importExcel
} from '@/api/rfq/common';
import {
  purchaseEnquiryAction,
  queryDetailAction,
  submitAudit,
  cancelAudit,
  auditHisList,
  testSuppliers
} from '@/api/rfq';
import { validatenull, validateNumber } from '@/util/validate';

import { ElsTemplateConfigService } from '@/api/templateConfig.js';
import { DIC } from '@/const/dic';

const validateQuantity = (rule, value, callback) => {
  if (!validatenull(value) && !validateNumber(value)) {
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
      configButtons: [],
      headerButtons: [{ power: true, text: '返回', type: '', size: '', action: 'on-cancel' }],
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
      configurations: [],
      purchaseRequest: false
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
  computed: {
    buttons() {
      return this.headerButtons;
    }
  },
  watch: {
    configButtons(newVal) {
      if (!validatenull(newVal))
        this.headerButtons = this.headerButtons.map((item) => {
          const index = newVal.findIndex((n) => n.name === item.action);
          if (index === -1) return item;
          item.power = newVal[index].display;
          if (
            (item.text === '退回' || item.text === '关闭') &&
            validatenull(this.form.enquiryNumber)
          )
            item.power = false;
          return item;
        });
    },
    purchaseRequest(newVal) {
      this.inquiryListOption.option.menu = true;
      this.headerButtons = [
        { power: !newVal, text: '退回', type: 'primary', size: '', action: 'on-back' },
        { power: true, text: '风险检测', type: 'primary', size: '', action: 'on-test' },
        { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
        { power: !newVal, text: '关闭', type: 'primary', size: '', action: 'on-close' },
        { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
        { power: true, text: '返回', type: '', size: '', action: 'on-cancel' }
      ];
      if (this.templateRule.enquiryIsProjectApproval === true && this.form.auditStatus !== '0') {
        this.headerButtons = this.headerButtons.map((item) => {
          if (item.action === 'on-release') {
            item.text = '提交审批';
            item.action = 'on-audit-submit';
          }
          return item;
        });
      }
      if (this.templateRule.enquiryIsProjectApproval === true && this.form.auditStatus === '2') {
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
      }
    },
    form(newVal) {
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
        this.inquiryListOption.option.menu = true;
        this.headerButtons = [
          {
            power:
              !this.purchaseRequest &&
              !validatenull(newVal.enquiryNumber) &&
              this.configurations[newVal.enquiryType].name !== 'RFP',
            text: '退回',
            type: 'primary',
            size: '',
            action: 'on-back'
          },
          {
            power:
              !validatenull(newVal.enquiryNumber) &&
              this.configurations[newVal.enquiryType].name !== 'RFP',
            text: '风险检测',
            type: 'primary',
            size: '',
            action: 'on-test'
          },
          { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
          {
            power: !this.purchaseRequest && !validatenull(newVal.enquiryNumber),
            text: '关闭',
            type: 'primary',
            size: '',
            action: 'on-close'
          },
          { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
          { power: true, text: '返回', type: '', size: '', action: 'on-cancel' }
        ];
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
      const editDis = newVal.auditStatus !== '2' && newVal.auditStatus !== '0';
      this.formOption.detail = newVal.auditStatus === '2' || newVal.auditStatus === '0';
      this.inquiryListOption.option.menu = editDis;
      this.inquiryListOption.option.header = editDis;

      if (newVal.flowCode) {
        this.headerButtons.push({
          power: true,
          text: '审批节点',
          type: 'primary',
          size: '',
          action: 'on-open-flow-dialog'
        });
        const content = {
          flowId: newVal.flowCode,
          businessType: 'editEnquiryAudit',
          auditStatus: newVal.auditStatus
        };
        setStore({ name: this.currentEnquiryNumber, content, type: true });
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
    async uploadFile(myfile) {
      const formdata = new FormData();
      formdata.append('file', myfile.file);
      uploadServlet(formdata)
        .then((res) => {
          console.log('上传结束', res);
          if (res.data.statusCode === '200') {
            const url = res.data.data[0].url;
            importExcel(url).then((result) => {
              if (result.data.statusCode === '200') {
                result.data.data.forEach((item) => {
                  const index = this.inquiryListOption.data.findIndex(
                    (i) => i.materialNumber === item.materialNumber
                  );
                  const accountList = item.toElsAccountList
                    ? item.toElsAccountList
                        .split(',')
                        .map((i) => {
                          return i.split('_')[1];
                        })
                        .toString()
                    : '';
                  item.accountList = accountList;
                  if (index === -1) {
                    this.inquiryListOption.data.push(item);
                  } else {
                    this.inquiryListOption.data.splice(index, 1, item);
                  }
                });
                return;
              }
              this.$message.error('导入失败');
            });
          } else {
            this.$message.error('上传失败');
          }
        })
        .catch(() => {
          this.$message.error('上传失败');
        });
    },
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
        { label: '物料编号', prop: 'materialNumber', width: 150 },
        { label: '物料名称', prop: 'materialName' },
        { label: '物料描述', prop: 'materialDesc' },
        { label: '单位', prop: 'baseUnit', span: 4 },
        { label: '需求数量', prop: 'quantity' },
        {
          type: 'tree',
          label: '工厂代码',
          span: 6,
          prop: 'companyCode',
          valueDefault: ''
        },
        { label: '供应商', prop: 'accountList' }
      ];
      this.inquiryListOption.option.column = baseColumn;
      this.dialogOption.column = [
        {
          label: '物料编号',
          prop: 'materialNumber',
          disabled: this.purchaseRequest,
          formslot: true
        },
        { label: '物料名称', prop: 'materialName' },
        // { label: '物料描述', prop: 'materialDesc' },
        {
          disabled: this.purchaseRequest,
          label: '需求数量',
          prop: 'quantity',
          rules: [{ trigger: 'change', validator: validateQuantity }]
        },
        { type: 'tree', label: '工厂代码', prop: 'companyCode' },
        {
          type: 'select',
          label: '税码',
          prop: 'taxCode',
          disabled: this.templateRule.enquiryPurchaserTax !== true
        },
        {
          label: '税率',
          prop: 'taxRate',
          disabled: true
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
        const configuration = this.configurations[value];
        this.templateRule = configuration.rule;
        this.initColumns();
        if (configuration.name === 'RFI') {
          this.inquiryListOption.option.column.splice(0, 5);
        }
        this.tabOption.option.column = [
          { label: '询价明细', prop: 'detail' },
          { label: '表单文件', prop: 'files' }
          // { label: '询价规则', prop: 'rules' }
        ];
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
        if (this.templateRule.enquiryIsProjectApproval === true && this.form.auditStatus !== '0') {
          this.headerButtons = this.headerButtons.map((item) => {
            if (item.action === 'on-release') {
              item.text = '提交审批';
              item.action = 'on-audit-submit';
            }
            return item;
          });
        }
        // 配置字段
        const current = configuration.tableColumns.map((item) => {
          let result = {};
          result.prop = item.prop;
          result.label = item.fbk1 || item.label;
          result.display = item.purchaseShow;
          result.hide = !item.purchaseShow;
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
          const index = this.dialogOption.column.findIndex((d) => d.prop === result.prop);
          if (index !== -1) {
            result = {
              ...this.dialogOption.column[index],
              ...result
            };
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
        const fieldColumns = configuration.fieldColumns;
        console.log('fieldColumns', fieldColumns);
        fieldColumns.forEach((item) => {
          if (this.formOption.column.filter((i) => i.prop === item.prop).length === 0) {
            const rules = [];
            if (item.isRequired) {
              rules.push({
                required: true,
                message: '请填写' + item.fbk1 || item.label,
                trigger: 'blur'
              });
            }
            delete item.disabled;
            delete item.readonly;
            this.formOption.column.push({
              span: item.span || 6,
              rules,
              ...item,
              disabled: !item.purchaseEdit,
              label: item.fbk1 || item.label
            });
          }
        });
        this.configButtons = configuration.buttons;
      } else {
        this.initColumns();
      }
      this.tableData();
    },
    handleAddShow(title, row) {
      this.fieldDialogForm = title === '添加' ? {} : row;
      console.log('this.fieldDialogForm', this.fieldDialogForm);
      this.dialogTitle = `${title}询价明细`;
      this.fieldDialogVisible = true;
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
          const field = [];
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
            // fieldColumns: field, // 头信息
            fieldColumns: this.$util.handlerLocalRolePermission(json.field), // 头信息
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
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'companyCode') {
            return {
              ...item,
              dicData: res.data.pageData.rows.map((item) => {
                return {
                  ...item,
                  value: `${item.orgId}_${item.orgDesc}`,
                  label: `${item.orgId}_${item.orgDesc}`
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
              type: 'tree',
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
      this.getSupplierPageData(1, 10);
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
    async getSupplierPageData(pageIndex, pageSize) {
      const res = await supplierMasterListAction({
        elsAccount: this.elsAccount,
        pageSize: pageSize,
        currentPage: pageIndex
      });
      if (res.data.statusCode !== '200') return;
      this.supplierList = res.data.pageData.rows;
      this.suppliersDialogOptionColumn.data = this.supplierList.map((item, index) => {
        return {
          label: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`,
          key: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`,
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
          this.$router.go(-1);
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
              id: `${i[0]}_${i[1]}_${i[2]}`,
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
    checkSubmit() {
      let r = { result: true, message: '' };
      if (this.templateRule.isMin3Supplier === true) {
        let result = false;
        this.inquiryListOption.data.forEach((item) => {
          if (item.toElsAccountList.split(',').length < 3) result = true;
        });
        if (result) {
          r = { result: false, message: '每个物料至少选择 3 个供应商参与报价' };
          return r;
        }
      } else {
        let result = false;
        this.inquiryListOption.data.forEach((item) => {
          if (
            !item.toElsAccountList ||
            (item.toElsAccountList && item.toElsAccountList.split(',').length === 0)
          )
            result = true;
        });
        if (result) {
          r = { result: false, message: '请选择供应商' };
          return r;
        }
      }
      if (this.inquiryListOption.data.length === 0) {
        r = { result: false, message: '请添加询价明细' };
        return r;
      }
      if (this.templateRule.enquiryPurchaserTax === true) {
        const validate = this.inquiryListOption.data.filter((item) => validatenull(item.taxRate));
        if (validate.length > 0) {
          r = { result: false, message: '请完善或税码/税率' };
          return r;
        }
      } else if (this.templateRule.enquiryPurchaserTax !== true) {
        // let validate = this.inquiryListOption.data.filter((item) => validatenull(item.quoteMethod));
        // if (validate.length > 0) {
        //   r = { result: false, message: '请完善报价方式' };
        //   return r;
        // }
      }
      return r;
    },
    // 发布/提交审批
    handleRelease() {
      const result = this.checkSubmit();
      if (!result.result) {
        this.$message.error(result.message);
        return;
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
                  item.quoteMethod = '0';
                  return item;
                });
                let params = {
                  ...this.form,
                  enquiryNumber: this.currentEnquiryNumber,
                  elsAccount: this.elsAccount,
                  quoteEndTime: this.form.quoteEndTime,
                  enquiryType: this.form.enquiryType,
                  enquiryDesc: this.form.enquiryDesc,
                  // companyCode: this.form.companyCode,
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
    handleOpenFlowDialog() {
      const event = {
        name: 'openFlowDialog',
        props: {
          flowId: this.form.flowCode
        }
      };
      window.parent.postMessage(event, '*');
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
            setTimeout(() => {
              this.$router.go(0);
            }, 1000);
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
      const result = this.checkSubmit();
      if (!result.result) {
        this.$message.error(result.message);
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
                  const validate = this.inquiryListOption.data.filter((item) =>
                    validatenull(item.taxRate)
                  );
                  if (validate.length > 0) {
                    this.$message.error('请完善或税码/税率');
                    return;
                  }
                } else if (this.templateRule.enquiryPurchaserTax !== true) {
                  // let validate = this.inquiryListOption.data.filter((item) =>
                  //   validatenull(item.quoteMethod)
                  // );
                  // if (validate.length > 0) {
                  //   this.$message.error('请完善报价方式');
                  //   return;
                  // }
                }

                const itemList = this.inquiryListOption.data;
                const paramsSave = {
                  ...this.form,
                  enquiryNumber: this.currentEnquiryNumber,
                  elsAccount: this.elsAccount,
                  quoteEndTime: this.form.quoteEndTime,
                  enquiryType: this.form.enquiryType,
                  enquiryDesc: this.form.enquiryDesc,
                  // companyCode: this.form.companyCode,
                  enquiryMethod: this.form.enquiryMethod,
                  canSeeRule: this.form.canSeeRule,
                  passWord: this.form.passWord,
                  itemList
                };
                purchaseEnquiryAction('save', paramsSave).then((res) => {
                  if (res.data.statusCode !== '200') {
                    this.$message.error('提交审批失败' + res.data.message);
                    return;
                  }

                  const action = 'submit';
                  const params = {
                    elsAccount: this.form.elsAccount,
                    businessType: 'editEnquiryAudit',
                    businessId: this.form.enquiryNumber,
                    params: JSON.stringify(paramsSave)
                  };
                  submitAudit(action, params).then((res) => {
                    if (res.data.statusCode === '200') {
                      this.$message.success('提交审批成功');
                      setTimeout(() => {
                        this.$router.go(0);
                      }, 1000);
                      return;
                    }
                    this.$message.error('提交审批失败');
                  });
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
              const validate = this.inquiryListOption.data.filter((item) =>
                validatenull(item.taxRate)
              );
              if (validate.length > 0) {
                this.$message.error('请完善或税码/税率');
                return;
              }
            } else if (this.templateRule.enquiryPurchaserTax !== true) {
              // let validate = this.inquiryListOption.data.filter((item) =>
              //   validatenull(item.quoteMethod)
              // );
              // if (validate.length > 0) {
              //   this.$message.error('请完善报价方式');
              //   return;
              // }
            }
            const itemList = this.inquiryListOption.data.map((item) => {
              item.quoteMethod = '0';
              return item;
            });
            const params = {
              ...this.form,
              enquiryNumber: this.currentEnquiryNumber,
              elsAccount: this.elsAccount,
              quoteEndTime: this.form.quoteEndTime,
              enquiryType: this.form.enquiryType,
              enquiryDesc: this.form.enquiryDesc,
              // companyCode: this.form.companyCode,
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
                // setTimeout(() => {
                //   this.$router.go(0);
                // }, 1000);
                this.initDetail();
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
          .length > 0 &&
        this.configurations[this.form.enquiryType].name !== 'RFI'
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
      this.$forceUpdate();
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
        const newSupplier = {
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
          return i.split('_')[1];
        });
        this.$set(this.inquiryListOption.data[index], 'accountList', suppliers.toString());
      }
      this.currentDetailItem = {};
      this.currentSelectionDetailItems = [];
      this.$refs.itemList.toggleSelection(false);
    },
    handleTest() {
      const selectSuppliers = [];
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
              this.showRelationDialog(selectSuppliers, res.data.data.data.companyRelationshipVOS);
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
