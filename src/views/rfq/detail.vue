<template>
  <div>
    <form-header
      titleText="预览"
      showButton
      :buttons="headerButtons"
      @on-close="handleClose"
      @on-submit-approval="handleSubmit"
      @on-update-end="handleUpdateEndDate"
    ></form-header>
    <avue-detail ref="form" v-model="detailObj" :option="formOption">
      <template slot="endDateForm">
        <el-date-picker
          v-model="detailObj.endDate"
          type="date"
          placeholder="选择日期"
          value-format="timestamp"
        ></el-date-picker>
        <!-- @change="handleYearChange" -->
      </template>
    </avue-detail>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <avue-crud
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
    </avue-crud>
    <avue-crud
      v-if="tabActive === 'detail'"
      :data="inquiryListOption.data"
      :option="inquiryListOption.option"
      :page.sync="inquiryListOption.page"
      v-model="inquiryListOption.obj"
      :span-method="spanMethod"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot="taxRate" slot-scope="scope">
        <span v-if="scope.row.itemStatus === '2'">**</span>
      </template>
      <template slot="priceIncludingTax" slot-scope="scope">
        <span v-if="scope.row.itemStatus === '2'">**</span>
      </template>
      <template slot-scope="scope" slot="option">
        <el-row :gutter="24">
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
    <field-dialog
      :dialogTitle="dialogTitle"
      :dialogOption="dialogOption"
      :field="fieldDialogForm"
      :fieldDialogVisible="fieldDialogVisible"
      :dialogWidth="dialogWidth"
      @on-save-form="onSaveForm"
      @close-field-dialog="closeFieldDialog"
    ></field-dialog>
  </div>
</template>

<script>
import { mySpanMethod } from '@/util/utils';
import FormHeader from '@/components/views/formHeader';
import fieldDialog from '@/components/views/fieldDialog';
import fieldDialogOption from '@/const/rfq/newAndView/quoteDialog';
import formOption from '@/const/rfq/newAndView/detail';
import tabOption from '@/const/rfq/newAndView/tabs';
import inquiryListOption from '@/const/rfq/newAndView/detailInquiryList';
import filesOption from '@/const/rfq/newAndView/fileList';

import { purchaseEnquiryAction, queryDetailAction } from '@/api/rfq';
import { dataDicAPI } from '@/api/rfq/common';

export default {
  components: {
    FormHeader,
    fieldDialog
  },
  data() {
    return {
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
      filesOption: filesOption,
      tabActive: 'detail',
      detailObj: {},
      filesForm: {},
      fieldDialogForm: {},
      fieldDialogVisible: false,
      dialogTitle: '',
      dialogWidth: '30%',
      dialogOption: fieldDialogOption,
      headerButtons: [
        { power: true, text: '返回', type: '', size: '', action: 'on-back' },
        { power: true, text: '更新时间', type: 'primary', size: '', action: 'on-update-end' },
        { power: true, text: '提交审批', type: 'primary', size: '', action: 'on-submit-approval' },
        { power: true, text: '关闭', type: 'primary', size: '', action: 'on-close' },
        { power: true, text: '开启', type: 'primary', size: '', action: 'on-open' }
      ],
      currentEnquiryNumber: ''
    };
  },
  created() {
    this.currentEnquiryNumber = this.$route.params.enquiryNumber;
    this.tableData();
    this.initDetail();
  },
  watch: {},
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
    handleAcceptShow(scope) {
      this.fieldDialogForm = {
        index: scope.index,
        quote: scope.row.quote
      };
      fieldDialogOption.column[0].label = `${scope.row.materialNo}配额`;
      this.dialogTitle = `${scope.row.supplier}(${scope.row.elsCount})供应商授标配额`;
      this.fieldDialogVisible = true;
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
    handleCancel() {
      this.$router.back();
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
    handleRadioChange(value, scope) {
      this.inquiryListOption.data[scope.row.$index].itemStatus = value;
      if (value === '5') {
        this.inquiryListOption.data[scope.row.$index].quota = '';
        this.inquiryListOption.data[scope.row.$index].$cellEdit = false;
      } else {
        this.inquiryListOption.data[scope.row.$index].$cellEdit = true;
      }
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    handleSubmit() {
      this.$confirm('是否提交审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          enquiryNumber: this.currentEnquiryNumber,
          itemList: this.inquiryListOption.data
        };
        purchaseEnquiryAction('acceptOrRefuse', params).then((res) => {
          if (res.data.statusCode !== '200') {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('提交成功');
        });
      });
    },
    handleUpdateEndDate() {
      this.$confirm('是否更新截止时间？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('detailObj', this.detailObj);
        purchaseEnquiryAction('updateQuoteEndTime', this.detailObj).then((res) => {
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
      });
      queryDetailAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          return {
            $cellEdit: item.itemStatus === '4',
            ...item
          };
        });
      });
    },
    // 配额保存
    onSaveForm(form) {
      console.log('form', form);
      this.fieldDialogVisible = false;
      this.inquiryListOption.data[form.index].quote = form.quote;
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
        [1, 2, 3, 4],
        'materialNo',
        'uuid',
        columnIndex,
        row
      );
    },
    tableData(data) {
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
