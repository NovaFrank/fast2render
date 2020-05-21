<template>
  <basic-container>
    <form-header
      titleText="预览"
      showButton
      :buttons="headerButtons"
      :timeHistory="timeHistory"
      @on-back="handleBack"
      @on-close="handleClose"
      @on-history="handleShowHistory"
      @on-new-supplier="handleNewSupplier"
      @on-open="handleShowOpen"
      @on-submit-approval="handleSubmitApproval"
      @on-update-end="handleUpdateQuoteEndTime"
      @show-time-history="handleShowTimeHistory"
    ></form-header>
    <avue-form ref="form" v-model="detailObj" :option="formOption">
      <template slot="quoteEndTime">
        <el-date-picker
          v-model="quoteEndTimeChange"
          type="datetime"
          placeholder="选择日期时间"
          value-format="timestamp"
          @change="handleQuoteEndTime"
        ></el-date-picker>
      </template>
    </avue-form>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <!-- 附件 -->
    <fast2-attachment-list
      :id="detailObj.enquiryNumber"
      :elsAccount="elsAccount"
      :businessElsAccount="detailObj.elsAccount"
      businessModule="enquiry"
      :readonly="true"
      v-show="tabActive === 'files'"
    ></fast2-attachment-list>
    <!-- <avue-crud
      v-if="tabActive === 'files'"
      :data="filesOption.data"
      :option="filesOption.option"
      :page.sync="filesOption.page"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot-scope="scope" slot="menu">
        <el-row :gutter="24">
          <el-col :span="6">
            <a :href="scope.url">下载</a>
          </el-col>
        </el-row>
      </template>
    </avue-crud> -->
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
      <template slot-scope="scope" slot="quoteMethod">
        <span v-if="scope.row.quoteMethod === '0'">常规报价</span>
        <p
          style="margin: 0"
          v-else-if="scope.row.quoteMethod === '1'"
          v-for="ladder in JSON.parse(scope.row.ladderPriceJson)"
          :key="ladder.ladderGrade"
        >
          {{ ladder.ladderGrade }}
        </p>
      </template>
      <template slot="taxRate" slot-scope="scope">
        {{
          scope.row.itemStatus === '2' && detailObj.quoteEndTime > new Date().getTime()
            ? '**'
            : scope.row.taxRate
        }}
      </template>
      <!-- <template slot="priceIncludingTax" slot-scope="scope">
        <div>
          <span
            v-if="
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
                detailObj.quoteEndTime > new Date().getTime()
            "
          >
            **
          </span>
          <avue-crud
            :cell-style="cellStyle"
            :header-cell-class-name="cHeaderStyle"
            :data="JSON.parse(scope.row.ladderPriceJson)"
            :option="quoteListOption.option"
            v-else-if="
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
                detailObj.quoteEndTime < new Date().getTime()
            "
          ></avue-crud>
        </div>
      </template> -->
      <template slot-scope="scope" slot="priceIncludingTax">
        <span v-if="scope.row.quoteMethod === '0'">
          <span
            v-if="
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
                detailObj.quoteEndTime > new Date().getTime()
            "
          >
            **
          </span>
          <span v-else>{{ scope.row.priceIncludingTax }}</span>
        </span>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '1'">
          <span
            v-if="
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
                detailObj.quoteEndTime > new Date().getTime()
            "
          >
            **
          </span>
          <span v-else>{{ getPriceIndex(scope.row, 'priceIncludingTax') }}</span>
        </p>
      </template>
      <template slot-scope="scope" slot="priceExcludingTax">
        <span v-if="scope.row.quoteMethod === '0'">
          <span
            v-if="
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
                detailObj.quoteEndTime > new Date().getTime()
            "
          >
            **
          </span>
          <span v-else>{{ scope.row.priceExcludingTax }}</span>
        </span>
        <p style="margin: 0" v-else-if="scope.row.quoteMethod === '1'">
          <span
            v-if="
              (scope.row.itemStatus === '2' || scope.row.itemStatus === '4') &&
                detailObj.quoteEndTime > new Date().getTime()
            "
          >
            **
          </span>
          <span v-else>{{ getPriceIndex(scope.row, 'priceExcludingTax') }}</span>
        </p>
      </template>
      <template slot-scope="scope" slot="option">
        <el-row v-if="detailObj.quoteEndTime < new Date().getTime()" :gutter="24">
          <!-- scope.row.itemStatus === '2' &&  -->
          <el-col :span="12">
            <avue-radio
              v-model="scope.row.itemStatus"
              :dic="dic"
              @change="(value) => handleRadioChange(value, scope)"
            ></avue-radio>
          </el-col>
          <el-col :span="12">
            <el-button
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
      :dialogVisible="historyVisible"
      :data="historyList"
      :quoteMethodData="quoteMethodData"
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
  </basic-container>
</template>

<script>
import { mySpanMethod } from '@/util/utils';
import FormHeader from '@/components/views/formHeader';
import formOption from '@/const/rfq/newAndView/detail';
import tabOption from '@/const/rfq/newAndView/tabs';
import inquiryListOption from '@/const/rfq/newAndView/detailInquiryList';
import filesOption from '@/const/rfq/newAndView/fileList';

import { getUserInfo, compare } from '@/util/utils.js';
import { purchaseEnquiryAction, queryDetailAction, submitAudit } from '@/api/rfq';
import { dataDicAPI, supplierMasterListAction } from '@/api/rfq/common';
import history from './history';
import { validatenull } from '@/util/validate';
import supplierSelectDialog from '@/const/rfq/newAndView/supplierSelectDialog';
import selectSupplierDialog from '@/components/views/selectSupplierDialog';
import quoteListOption from '@/const/rfq/newAndView/detailInquiryQuote';

import openDialog from '@/components/views/openDialog';
import openFormOption from '@/const/rfq/newAndView/openForm';
import { setStore } from '@/util/store.js';

export default {
  components: {
    FormHeader,
    history,
    selectSupplierDialog,
    openDialog
  },
  data() {
    return {
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
      inquiryListOption: inquiryListOption,
      quoteListOption: quoteListOption,
      filesOption: filesOption,
      tabActive: 'detail',
      detailObj: {},
      filesForm: {},
      headerButtons: [
        { power: true, text: '返回', type: '', size: '', action: 'on-back' },
        { power: true, text: '更新时间', type: 'primary', size: '', action: 'on-update-end' },
        { power: true, text: '提交审批', type: 'primary', size: '', action: 'on-submit-approval' },
        { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' },
        { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
        // { power: true, text: '开启', type: 'primary', size: '', action: 'on-open' },
        { power: true, text: '发布新供应商', type: 'primary', size: '', action: 'on-new-supplier' }
      ],
      historyVisible: false,
      historyList: [],
      quoteMethodData: [],
      openDialogVisible: false,
      openFormOption: openFormOption,
      suppliersDialogVisable: false,
      suppliersDialogOptionColumn: supplierSelectDialog.option.column,
      currentDetailItem: {}, // 当前选中物料行
      currentDetailItemSelected: [], // 当前选中物料行已有供应商 toElsAccount,
      timeHistory: [],
      quoteEndTimeChange: null,
      currentEnquiryNumber: ''
    };
  },
  created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.currentEnquiryNumber = this.$route.params.enquiryNumber;
    this.tableData();
    this.initDetail();
  },
  watch: {
    detailObj(newVal) {
      this.quoteEndTimeChange = newVal.quoteEndTime;
    }
  },
  methods: {
    getPriceIndex(row, column) {
      const quantity = row.quantity;
      const quantityList = JSON.parse(row.ladderPriceJson).map((item) => {
        return Number(item.ladderQuantity);
      });
      quantityList.push(quantity);
      const index = quantityList.findIndex((item) => item === Number(quantity));
      return JSON.parse(row.ladderPriceJson)[index - 1][column];
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
    },
    currentChange(val) {
      this.inquiryListOption.page.currentPage = val;
      this.tableData({
        currentPage: val,
        pageSize: this.inquiryListOption.page.pageSize
      });
    },
    handleAgainQuote(row) {
      this.$confirm('确定要该供应商物料重报价？', '提示', {
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
      this.$router.push({ path: '/list' });
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
          return item.toElsAccount;
        });
      this.currentDetailItem = {
        ...row,
        selectedSupplier: this.currentDetailItemSelected
      };
    },
    handleNewSupplier() {
      this.$confirm('是否发布新供应商？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          ...formOption.detailObj,
          enquiryNumber: this.currentEnquiryNumber,
          quoteEndTime: this.detailObj.quoteEndTime,
          itemList: this.inquiryListOption.data
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
      this.inquiryListOption.data[scope.row.$index].itemStatus = value;
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
      });
      this.historyVisible = true;
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
      console.log(form);
      this.detailObj.quoteEndTime = new Date().getTime();
      this.openDialogVisible = false;
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    handleShowSupplierSelect() {
      if (validatenull(this.currentDetailItem)) {
        this.$message.warning('请选择物料');
        return;
      }
      this.suppliersDialogVisable = true;
    },
    handleSubmitApproval() {
      this.$confirm('是否提交审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // const params = {
        //   enquiryNumber: this.currentEnquiryNumber,
        //   itemList: this.inquiryListOption.data
        // };
        // purchaseEnquiryAction('acceptOrRefuse', params).then((res) => {
        //   if (res.data.statusCode !== '200') {
        //     this.$message.error(res.data.message);
        //     return;
        //   }
        //   this.$message.success('提交成功');
        // });

        const action = 'submit';
        let params = {
          elsAccount: this.detailObj.elsAccount,
          // toElsAccount: this.detailObj.toElsAccount,
          businessType: 'bargainEnquiryAudit',
          businessId: this.detailObj.enquiryNumber,
          params: '{"key1":"123"}'
        };
        submitAudit(action, params).then((res) => {
          console.log(res);
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

        if (res.data.data.flowCode) {
          let content = {
            flowId: res.data.data.flowCode,
            businessType: 'bargainEnquiryAudit'
          };
          setStore({ name: res.data.data.orderNumber, content, type: true });
        }
      });
      queryDetailAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          return {
            id: item.uuid,
            $cellEdit: item.itemStatus === '4',
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
        (item) => !this.currentDetailItemSelected.includes(item)
      );
      const itemList = newSuppliers.map((item, index) => {
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
          canDeliveryDate: this.currentDetailItem.canDeliveryDate,
          quoteMethod: this.currentDetailItem.quoteMethod,
          itemStatus: '1',
          taxRate: this.currentDetailItem.taxRate,
          priceIncludingTax: '',
          quota: '',
          ladderPriceJson: this.currentDetailItem.ladderPriceJson || null,
          $cellEdit: false
        };
      });
      this.inquiryListOption.data = this.inquiryListOption.data
        .concat(itemList)
        .sort(compare('materialNumber'));
    },
    tableData(data) {
      // 报价方式 数据字典
      dataDicAPI('quoteMethod').then((res) => {
        this.quoteMethodData = res.data;
      });
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
      // 供应商列表 supplierMasterListAction
      supplierMasterListAction({ elsAccount: this.elsAccount }).then((res) => {
        this.supplierList = res.data.pageData.rows;
        this.suppliersDialogOptionColumn.data = this.supplierList.map((item, index) => {
          return {
            label: item.toElsAccount,
            key: item.toElsAccount
          };
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

<style>
.none-border-right {
  border-right: none !important;
}
</style>
