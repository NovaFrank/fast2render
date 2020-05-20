<template>
  <basic-container>
    <form-header
      titleText="新建询价单"
      showButton
      :buttons="headerButtons"
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
    </avue-form>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <!-- <avue-form
      v-if="tabActive === 'files'"
      :option="filesOption.option"
      v-model="filesForm"
      :upload-before="uploadBefore"
      :upload-after="uploadAfter"
    ></avue-form> -->
    <!-- 表单文件 -->
    <fast2-attachment-list
      ref="attachment"
      :id="form.enquiryNumber"
      :elsAccount="elsAccount"
      :businessElsAccount="elsAccount"
      businessModule="enquiry"
      v-show="tabActive === 'files' && form.enquiryNumber"
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
        <span v-if="scope.row.quoteMethod === '0'">常规报价</span>
        <div v-else-if="scope.row.quoteMethod === '1'">
          <span>阶梯报价</span>
          <p
            style="margin: 0"
            v-for="ladder in JSON.parse(scope.row.ladderPriceJson)"
            :key="ladder.ladderGrade"
          >
            {{ ladder.ladderGrade }}
          </p>
        </div>
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
    <!-- 供应商列表 -->
    <!-- <SelectDialogTable
      ref="suppliersDialog"
      :dialogVisible.sync="suppliersDialogVisable"
      :title="'供应商'"
      :column="suppliersDialogOptionColumn"
      :data="suppliersDialogData"
      :page="suppliersDialogPage"
      :queryParam="suppliersDialogQueryParam"
      :pageParam="suppliersDialogPageParam"
      :multiple="true"
      @save="suppliersDialogSave"
      @handleList="suppliersHandleList"
    ></SelectDialogTable> -->
    <select-supplier-dialog
      ref="suppliersDialog"
      :dialogVisible.sync="suppliersDialogVisable"
      :title="'供应商'"
      :data="suppliersDialogOptionColumn.data"
      :crudObj="currentDetailItem"
      @on-save="suppliersDialogSaveTransfer"
    ></select-supplier-dialog>
  </basic-container>
</template>

<script>
import FormHeader from '@/components/views/formHeader';
import fieldDialog from '@/components/views/fieldDialog';
// import SelectDialogTable from '@/components/views/SelectDialogTable';
import fieldDialogOption from '@/const/rfq/newAndView/formDialog';
import formOption from '@/const/rfq/newAndView/form';
import tabOption from '@/const/rfq/newAndView/tabs';
import inquiryListOption from '@/const/rfq/newAndView/inquiryList';
import filesOption from '@/const/rfq/newAndView/files';
import supplierSelectDialog from '@/const/rfq/newAndView/supplierSelectDialog';
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
import { validatenull } from '@/util/validate';

export default {
  components: {
    FormHeader,
    fieldDialog,
    // SelectDialogTable,
    selectSupplierDialog
  },
  data() {
    return {
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
      currentEnquiryNumber: ''
    };
  },
  created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.tableData(); // 加载当前页面需要的数据
    if (!validatenull(this.$route.query.enquiryNumber)) {
      this.currentEnquiryNumber = this.$route.query.enquiryNumber;
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
      this.inquiryListOption.data = [];
      this.$forceUpdate();
    }
  },
  methods: {
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
    handleAddShow(title, row) {
      // 币别
      dataDicAPI('currency').then((res) => {
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'currency') {
            return {
              ...item,
              dicData: res.data
            };
          }
          return item;
        });
      });
      // 币别
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
      this.fieldDialogForm = title === '添加' ? {} : row;
      this.dialogTitle = `${title}询价明细`;
      this.fieldDialogVisible = true;
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
      console.log(selection);
      this.currentSelectionDetailItems = selection;
    },
    // 发布/提交审批
    handleRelease() {
      this.$confirm('是否发布？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (this.inquiryListOption.data.length === 0) {
              this.$message.error('请添加询价明细');
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
            this.$refs.attachment.sendFiles();
          }
        });
      });
    },
    // 表单保存
    handleSaveForm() {
      this.$confirm('是否保存？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (this.inquiryListOption.data.length === 0) {
              this.$message.error('请添加询价明细');
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
              this.$router.push({ path: '/new', query: { enquiryNumber } });
            });
          }
        });
      });
    },
    handleShowSupplierSelect() {
      console.log(
        'this.currentSelectionDetailItems.length',
        this.currentSelectionDetailItems.length
      );
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
    suppliersHandleList() {
      // let listParams = deepClone(this.materialsDialogQueryParam);
      // Object.assign(listParams, this.materialsDialogPageParam);
      // getMaterialsData(listParams).then((res) => {
      //   const data = res.data;
      //   setTimeout(() => {
      //     this.materialsDialogData = data.items;
      //     this.materialsDialogPage = {
      //       total: data.paginator.total,
      //       pageSize: data.paginator.pageSize,
      //       currentPage: data.paginator.currentPage
      //     };
      //   }, 1000);
      // });
    },
    tableData(data) {
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
      // 询价类型 数据字典（临时），最好写option dicUrl
      dataDicAPI('enquiryType').then((res) => {
        this.formOption.column = this.formOption.column.map((item) => {
          if (item.prop === 'enquiryType') {
            return {
              ...item,
              dicData: res.data
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
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'quoteMethod') {
            return {
              ...item,
              dicData: res.data
            };
          }
          return item;
        });
      });
      // 供应商列表 supplierMasterListAction
      supplierMasterListAction({ elsAccount: this.elsAccount }).then((res) => {
        this.supplierList = res.data.pageData.rows;
        this.suppliersDialogOptionColumn.data = this.supplierList.map((item, index) => {
          return {
            label: `${item.toElsAccount}_${item.supplierName}`,
            key: `${item.toElsAccount}_${item.supplierName}`
          };
        });
        this.dialogOption.column = this.dialogOption.column.map((item) => {
          if (item.prop === 'toElsAccountList') {
            return {
              dicData: this.supplierList.map((item) => {
                return {
                  label: `${item.toElsAccount}_${item.supplierName}`,
                  value: `${item.toElsAccount}_${item.supplierName}`
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
    },
    uploadAfter(res, done, loading) {
      console.log('after upload', res);
      done();
    },
    uploadBefore(file, done, loading) {
      console.log('before upload', file);
      // 如果你想修改file文件,由于上传的file是只读文件，必须复制新的file才可以修改名字，完后赋值到done函数里,如果不修改的话直接写done()即可
      const newFile = new File([file], '1234', { type: file.type });
      done(newFile);
    }
  }
};
</script>
