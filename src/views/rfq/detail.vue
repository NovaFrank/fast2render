<template>
  <div>
    <form-header
      titleText="预览"
      showButton
      :buttons="headerButtons"
      @on-close="handleClose"
      @on-save="handleSave"
    ></form-header>
    <avue-detail ref="form" v-model="detailObj" :option="formOption">
      <template slot="quoteDeadlineForm">
        <el-date-picker
          v-model="detailObj.quoteDeadline"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
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
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot-scope="scope" slot="menu">
        <el-row :gutter="24">
          <el-col :span="6">
            <a class="scope-btn" @click.stop="handleAcceptShow(scope)">接受</a>
          </el-col>
          <el-col :span="6">
            <a class="scope-btn">重报价</a>
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
import FormHeader from '@/components/views/formHeader';
import fieldDialog from '@/components/views/fieldDialog';
import fieldDialogOption from '@/const/rfq/newAndView/quoteDialog';
import formOption from '@/const/rfq/newAndView/detail';
import tabOption from '@/const/rfq/newAndView/tabs';
import inquiryListOption from '@/const/rfq/newAndView/inquiryList';
import filesOption from '@/const/rfq/newAndView/fileList';
import { elsFromSta } from '@/api/rfq';

export default {
  components: {
    FormHeader,
    fieldDialog
  },
  data() {
    return {
      formOption: formOption,
      tabOption: tabOption,
      inquiryListOption: inquiryListOption,
      filesOption: filesOption,
      tabActive: 'detail',
      detailObj: {
        formBusiness: 'Form Business',
        inquiryTime: '2019-10-23',
        quoteDeadline: '2019-12-09',
        inCharge: 'In Charge',
        mark: 'Mark'
      },
      filesForm: {},
      fieldDialogForm: {},
      fieldDialogVisible: false,
      dialogTitle: '',
      dialogWidth: '30%',
      dialogOption: fieldDialogOption,
      headerButtons: [
        {
          text: '关闭',
          type: 'primary',
          size: '',
          action: 'on-close'
        },
        {
          text: '保存',
          type: 'primary',
          size: '',
          action: 'on-save'
        }
      ]
    };
  },
  created() {
    this.tableData();
  },
  watch: {
    tabActive() {
      // this.tableData()
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
    handleAcceptShow(scope) {
      console.log('scope', scope.index, scope.row);
      this.fieldDialogForm = {
        index: scope.index,
        quote: scope.row.quote
      };
      fieldDialogOption.column[0].label = `${scope.row.materialNo}配额`;
      this.dialogTitle = `${scope.row.supplier}(${scope.row.elsCount})供应商授标配额`;
      this.fieldDialogVisible = true;
    },
    handleCancel() {
      this.$router.back();
    },
    handleClose() {},
    handleDelete(row) {
      this.$confirm('确定删除？', '提示').then(() => {
        let params = {
          elsAccount: row.elsAccount,
          whetherDefault: row.whetherDefault,
          fromDesc: row.fromDesc,
          fromBusiness: row.fromBusiness,
          fbk1: this.fbk1
        };
        elsFromSta('delElsFromSta', params).then((res) => {
          if (res.data.statusCode) {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('删除成功');
          this.tableData();
        });
      });
    },
    handleSave() {},
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    // 配额保存
    onSaveForm(form) {
      console.log('form', form);
      inquiryListOption.data[form.index].quote = form.quote;
      this.fieldDialogVisible = false;
    },
    sizeChange(val) {
      this.inquiryListOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    tableData(data) {
      // const params = {
      //   pageSize: this.inquiryListOption.page.pageSize || 10,
      //   currentPage: 1,
      //   ...data,
      //   tabActive: this.tabActive
      // };
      // elsFromSta('queryElsFromSta', params).then((res) => {
      //   if (res.data.statusCode) {
      //     this.$message.error(res.data.message);
      //     return;
      //   }
      //   this.inquiryListOption.data = res.data.rows;
      //   this.inquiryListOption.page.total = res.data.total;
      // });
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
