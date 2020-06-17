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
    <!-- 表单文件 -->
    <fast2-attachment-list
      ref="attachment"
      :id="form.enquiryNumber"
      :elsAccount="elsAccount"
      :businessElsAccount="elsAccount"
      businessModule="enquiry"
      v-show="tabActive === 'files' && form.enquiryNumber"
      :passClient="false"
      :client="false"
      :clientTab="false"
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
      <template slot="menuLeft" v-if="!form.purchaseRequestNumber">
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
// import SelectDialogTable from '@/components/views/SelectDialogTable';
import fieldDialogOption from '@/const/rfq/newAndView/formDialog'; // 询价明细弹窗option
import formOption from '@/const/rfq/newAndView/form';
import tabOption from '@/const/rfq/newAndView/tabs';
import inquiryListOption from '@/const/rfq/newAndView/inquiryList';
import filesOption from '@/const/rfq/newAndView/files';
import supplierSelectDialog from '@/const/rfq/newAndView/supplierSelectDialog';
import relationDialog from './relationship/dialog';
import selectSupplierDialog from '@/components/views/selectSupplierDialog';
import { getUserInfo } from '@/util/utils.js';

import {
  orgList,
  dataDicAPI,
  materialListAction,
  supplierMasterListAction,
  accountListAction
} from '@/api/rfq/common';
import { purchaseEnquiryAction, queryDetailAction } from '@/api/rfq';
import { validatenull, validateNumber } from '@/util/validate';
import { testSuppliers } from '@/api/rfq/index';

import { ElsTemplateConfigService } from '@/api/templateConfig.js';

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
    // SelectDialogTable,
    selectSupplierDialog,
    relationDialog
  },
  data() {
    return {
      relation: {},
      selectedSupplier: [],
      data: {},
      elsAccount: '',
      elsSubAccount: '',
      headerButtons: [
        { power: true, text: '删除', type: 'primary', size: '', action: 'on-delete' },
        { power: true, text: '退回', type: 'primary', size: '', action: 'on-back' },
        { power: true, text: '返回', type: '', size: '', action: 'on-cancel' },
        { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
        { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
        { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' }
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
      configurations: {}
    };
  },
  created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    // this.$getBlockItem('rfq-header').then((res) => {
    //   this.formOption.column = res[0].data.column.map((item) => {
    //     if (item.prop === 'enquiryNumber') item.formslot = true;
    //     if (item.prop === 'companyCode') item.type = 'tree';
    //     if (item.prop === 'quoteEndTime') {
    //       item.type = 'datetime';
    //       item.format = 'yyyy-MM-dd HH:mm:ss';
    //       item.valueFormat = 'timestamp';
    //     }
    //     if (item.prop === 'enquiryType') {
    //       item.type = 'select';
    //       item.formslot = true;
    //     }
    //     return item;
    //   });
    // });
    this.tableData(); // 加载当前页面需要的数据
    if (!validatenull(this.$route.params.enquiryNumber)) {
      this.currentEnquiryNumber = this.$route.params.enquiryNumber;
      this.initDetail();
    } else {
      this.currentEnquiryNumber = '';
    }
  },
  watch: {
    form(newVal) {
      if (this.form.purchaseRequestNumber) {
        this.inquiryListOption.option.menu = false;
        this.headerButtons = [
          // { power: true, text: '删除', type: 'primary', size: '', action: 'on-delete' },
          { power: true, text: '退回', type: 'primary', size: '', action: 'on-back' },
          { power: true, text: '风险检测', type: 'primary', size: '', action: 'on-test' },
          { power: true, text: '返回', type: '', size: '', action: 'on-cancel' },
          { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
          { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
          { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' }
        ];
      } else {
        this.inquiryListOption.option.menu = true;
        this.headerButtons = [
          // { power: true, text: '删除', type: 'primary', size: '', action: 'on-delete' },
          // { power: true, text: '退回', type: 'primary', size: '', action: 'on-back' },
          { power: true, text: '返回', type: '', size: '', action: 'on-cancel' },
          { power: true, text: '风险检测', type: 'primary', size: '', action: 'on-test' },
          { power: true, text: '发布', type: 'primary', size: '', action: 'on-release' },
          { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
          { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' }
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
      if (newVal.enquiryType) {
        this.handleEnquiryTypeChange(newVal.enquiryType);
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
    handleEnquiryTypeChange(value) {
      const baseColumn = [
        { label: '物料编号', prop: 'materialNumber' },
        { label: '物料名称', prop: 'materialName' },
        { label: '物料描述', prop: 'materialDesc' },
        { label: '规格', prop: 'materialSpecifications' },
        { label: '单位', prop: 'baseUnit', span: 4 },
        { label: '需求数量', prop: 'quantity' },
        { label: '供应商', prop: 'toElsAccountList' },
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
          // dicUrl: '/layout/dics/value/taxRate',
          // dicMethod: 'get',
          type: 'select',
          label: '税码',
          prop: 'taxCode',
          rules: [{ required: true, message: '请选择税码', trigger: 'blur' }]
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
    tableData(data) {
      ElsTemplateConfigService.find({
        elsAccount: this.elsAccount,
        businessModule: 'enquiry',
        currentVersionFlag: 'Y'
      })
        .then((res) => {
          this.requestTypeDict = [];
          const configurations = [];

          if (res.data && res.data.statusCode === '200' && res.data.pageData) {
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
          } else {
            this.requestTypeDict = [];
            this.$message.error('查找采购申请配置数据失败, ' + res.data.message || '');
          }
        })
        .catch((err) => {
          this.requestTypeDict = [];
          this.$message.error('查找采购申请配置数据失败, ' + err.message || '');
        });
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
                  label: item.orgId // `${item.orgId}_${item.orgDesc}`
                };
              })
            };
          }
          return item;
        });
      });
      // 公开方式 数据字典
      // dataDicAPI('enquiryMethod').then((res) => {
      //   this.formOption.column = this.formOption.column.map((item) => {
      //     if (item.prop === 'enquiryMethod') {
      //       return {
      //         ...item,
      //         dicData: res.data
      //       };
      //     }
      //     return item;
      //   });
      // });
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
            label: `${item.toElsAccount}_${item.supplierName}_${item.firstType}`,
            key: `${item.toElsAccount}_${item.supplierName}_${item.firstType}`
          };
        });
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'toElsAccountList') {
            return {
              dicData: this.supplierList.map((item) => {
                return {
                  label: `${item.toElsAccount}_${item.supplierName}_${item.firstType}`,
                  value: `${item.toElsAccount}_${item.supplierName}_${item.firstType}`
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
      this.currentDetailItem = {
        ...row,
        selectedSupplier: row.toElsAccountList ? row.toElsAccountList.split(',') : []
      };
    },
    handleMaterialSelectChange(selection) {
      this.currentSelectionDetailItems = selection;
    },
    // 发布/提交审批
    handleRelease() {
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
                if (this.inquiryListOption.data.length === 0) {
                  this.$message.error('请添加询价明细');
                  return;
                }
                let validate = this.inquiryListOption.data.filter(
                  (item) => validatenull(item.quoteMethod) || validatenull(item.taxRate)
                );
                if (validate.length > 0) {
                  this.$message.error('请完善报价方式或税码/税率');
                  return;
                }
                let params = {
                  enquiryNumber: this.currentEnquiryNumber,
                  elsAccount: this.elsAccount,
                  // beginDate: this.form.beginDate,
                  quoteEndTime: this.form.quoteEndTime,
                  enquiryType: this.form.enquiryType,
                  enquiryDesc: this.form.enquiryDesc,
                  companyCode: this.form.companyCode,
                  // responsible: this.form.responsible,
                  enquiryMethod: this.form.enquiryMethod,
                  canSeeRule: this.form.canSeeRule,
                  passWord: this.form.passWord,
                  itemList: this.inquiryListOption.data
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
    // 表单保存
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
            let validate = this.inquiryListOption.data.filter(
              (item) => validatenull(item.quoteMethod) || validatenull(item.taxRate)
            );
            if (validate.length > 0) {
              this.$message.error('请完善报价方式或税码/税率');
              return;
            }
            const params = {
              enquiryNumber: this.currentEnquiryNumber,
              elsAccount: this.elsAccount,
              // beginDate: this.form.beginDate,
              quoteEndTime: this.form.quoteEndTime,
              enquiryType: this.form.enquiryType,
              enquiryDesc: this.form.enquiryDesc,
              companyCode: this.form.companyCode,
              // responsible: this.form.responsible,
              enquiryMethod: this.form.enquiryMethod,
              canSeeRule: this.form.canSeeRule,
              passWord: this.form.passWord,
              itemList: this.inquiryListOption.data
            };
            purchaseEnquiryAction('save', params).then((res) => {
              if (res.data.statusCode !== '200') {
                this.$message.error(res.data.message);
                return;
              }
              this.$message.success('保存成功');
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
      this.form = {};
      this.inquiryListOption.data = [];
      queryDetailAction('findHeadDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.form = res.data.data;
      });
      queryDetailAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows;
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
      if (form.quoteMethod === '1') {
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
      // this.currentSelectionDetailItems;
      if (this.currentSelectionDetailItems.length > 0) {
        this.currentSelectionDetailItems.forEach((item) => {
          const index = item.$index;
          this.$set(
            this.inquiryListOption.data[index],
            'toElsAccountList',
            selectedSupplier.toString()
          );
        });
        return;
      }
      const index = this.currentDetailItem.$index;
      this.$set(
        this.inquiryListOption.data[index],
        'toElsAccountList',
        selectedSupplier.toString()
      );
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
