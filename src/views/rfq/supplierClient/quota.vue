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
    <avue-form ref="form" v-model="detailObj" :option="formOption"></avue-form>
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
      @size-change="sizeChange"
      @current-change="currentChange"
    >
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
      <template slot-scope="scope" slot="quote">
        <avue-radio
          v-model="scope.row.noQuoted"
          :disabled="!['1', '3'].includes(scope.row.itemStatus)"
          :dic="dic"
          @change="(value) => handleRadioChange(value, scope)"
        ></avue-radio>
      </template>
      <template slot-scope="scope" slot="menu">
        <el-button
          v-if="scope.row.noQuoted !== 'N' && ['1', '3'].includes(scope.row.itemStatus)"
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
    ></quote-dialog>
    <!-- 阶梯报价 -->
    <quote-ladder-dialog
      :dialogTitle="dialogTitle"
      :field="fieldDialogForm"
      :fieldDialogVisible="ladderQuoteVisible"
      :dialogWidth="dialogWidth"
      @on-save-form="onSaveLadderForm"
      @close-field-dialog="closeFieldDialog"
    ></quote-ladder-dialog>
    <!-- 报价历史记录 -->
    <history :dialogVisible="historyVisible" :data="historyList"></history>
  </basic-container>
</template>

<script>
import FormHeader from '@/components/views/formHeader';
import quoteLadderDialog from '@/components/views/quoteDialog'; // 阶梯报价
import quoteDialog from '@/components/views/quoteDialog0'; // 常规报价
import formOption from '@/const/rfq/supplierClient/detail';
import tabOption from '@/const/rfq/newAndView/tabs';
import filesOption from '@/const/rfq/newAndView/fileList';

import { queryDetailAction } from '@/api/rfq';
import { getAction, postAction } from '@/api/rfq/supplierClient';
import inquiryListOption from '@/const/rfq/supplierClient/inquiryList';
import history from './../history';
import { validatenull } from '@/util/validate';
import {
  dataDicAPI
  // materialListAction,
  // supplierMasterListAction,
  // accountListAction
} from '@/api/rfq/common';

export default {
  components: {
    FormHeader,
    quoteDialog,
    quoteLadderDialog,
    history
  },
  data() {
    return {
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
      ladderQuoteVisible: false,
      quoteVisible: false,
      historyVisible: false,
      historyList: [],
      dialogTitle: '',
      dialogWidth: '50%',
      headerButtons: [
        { power: true, text: '返回', type: '', size: '', action: 'on-back' },
        { power: true, text: '保存', type: 'primary', size: '', action: 'on-save' },
        { power: true, text: '报价记录', type: 'primary', size: '', action: 'on-history' },
        { power: true, text: '发送', type: 'primary', size: '', action: 'on-send' }
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
      this.ladderQuoteVisible = false;
      this.quoteVisible = false;
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
      queryDetailAction('queryQuote', this.currentEnquiryNumber).then((res) => {
        this.historyList = res.data.pageData.rows;
      });
      this.historyVisible = true;
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
      } else {
        this.fieldDialogForm = {
          index: scope.index,
          taxRate: scope.row.taxRate,
          ladderPriceJson: scope.row.ladderPriceJson || null,
          remark: scope.row.remark || ''
        };
        this.ladderQuoteVisible = true;
      }
    },
    handleRadioChange(value, scope) {
      if (value === 'N') {
        this.inquiryListOption.data[scope.row.$index].priceIncludingTax = '';
        this.inquiryListOption.data[scope.row.$index].taxRate = '';
        this.inquiryListOption.data[scope.row.$index].priceExcludingTax = '';
        this.inquiryListOption.data[scope.row.$index].cellEdit = false; // $cellEdit = false;
        // if (scope.row.quoteMethod === '0') {
        //   this.inquiryListOption.data[scope.row.$index].$cellEdit = false;
        // }
      } else {
        this.inquiryListOption.data[scope.row.$index].cellEdit = true; // $cellEdit = true;
        // if (scope.row.quoteMethod === '0') {
        //   this.inquiryListOption.data[scope.row.$index].$cellEdit = true;
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
        console.log(item.noQuoted, item.inquiryListOption, item);
        if (item.quoteMethod === '0' && validatenull(item.priceIncludingTax)) {
          // 常规报价
          result = false;
        }
        if (item.quoteMethod === '1') {
          JSON.parse(item.ladderPriceJson).forEach((ladder) => {
            if (validatenull(ladder.priceIncludingTax)) {
              result = false;
            }
          });
        }
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
    initDetail() {
      this.detailObj = {};
      this.inquiryListOption.data = [];
      getAction('findHeadDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.detailObj = res.data.data;
      });
      // new itemStatus 0
      // quoting itemStatus 1
      // price itemStatus 4/5
      // close itemStatus 6
      getAction('findItemDetails', this.currentEnquiryNumber).then((res) => {
        if (!this.initDetailError(res)) return;
        this.inquiryListOption.data = res.data.pageData.rows.map((item) => {
          return {
            // $cellEdit: ['1', '3'].includes(item.itemStatus) && item.noQuoted === 'Y', // 重报价/报价中，且报价 是
            ...item,
            noQuoted: item.noQuoted || 'Y'
          };
        });
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
    sizeChange(val) {
      this.inquiryListOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    tableData(data) {
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
      // 报价方式 数据字典
      dataDicAPI('quoteMethod').then((res) => {
        this.inquiryListOption.option.column = this.inquiryListOption.option.column.map((item) => {
          if (item.prop === 'quoteMethod') {
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
