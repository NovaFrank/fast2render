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
          @change="handleYearChange"
        ></el-date-picker>
      </template>
    </avue-detail>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <avue-form
      v-if="tabActive === 'files'"
      :option="filesOption.option"
      v-model="filesForm"
      :upload-before="uploadBefore"
      :upload-after="uploadAfter"
    ></avue-form>
    <avue-crud
      v-if="tabActive === 'detail'"
      :data="inquiryListOption.data"
      :option="inquiryListOption.option"
      :page.sync="inquiryListOption.page"
      v-model="inquiryListOption.obj"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot="menuLeft">
        <el-button size="small" @click.stop="handleAddShow('添加', {})">添加行</el-button>
      </template>
      <template slot-scope="scope" slot="menu">
        <el-row :gutter="24">
          <el-col :span="6">
            <a class="scope-btn" @click.stop="handleAddShow('修改', scope.row)">编辑</a>
          </el-col>
          <el-col :span="6">
            <a class="scope-btn">删除</a>
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
import fieldDialogOption from '@/const/rfq/newAndView/formDialog';
import formOption from '@/const/rfq/newAndView/detail';
import tabOption from '@/const/rfq/newAndView/tabs';
import inquiryListOption from '@/const/rfq/newAndView/inquiryList';
import filesOption from '@/const/rfq/newAndView/files';
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
      dialogWidth: '50%',
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
    handleAddShow(title, row) {
      this.fieldDialogForm =
        title === '添加'
          ? {
              elsAccount: 307000,
              whetherDefault: 'Y',
              fromDesc: '',
              fromBusiness: ''
            }
          : row;
      this.dialogTitle = `${title}询价明细`;
      this.fieldDialogVisible = true;
    },
    handleCancel() {
      this.$router.back();
    },
    handleClose() {},
    handleSave() {},
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    onSaveForm(form) {
      let params = {
        elsAccount: form.elsAccount,
        whetherDefault: form.whetherDefault,
        fromDesc: form.fromDesc,
        fromBusiness: form.fromBusiness
      };
      let action = 'saveElsFromSta';
      if (this.dialogTitle === '新建类型') {
        action = 'insertElsFromSta';
        params = {
          ...params,
          fbk1: this.fbk1
        };
      }
      elsFromSta(action, params).then((res) => {
        if (res.data.statusCode) {
          this.$message.error(res.data.message);
          return;
        }
        this.$message.success('保存成功');
        this.tableData();
      });
    },
    sizeChange(val) {
      this.inquiryListOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    tableData(data) {
      const params = {
        pageSize: this.inquiryListOption.page.pageSize || 10,
        currentPage: 1,
        ...data,
        tabActive: this.tabActive
      };
      elsFromSta('queryElsFromSta', params).then((res) => {
        if (res.data.statusCode) {
          this.$message.error(res.data.message);
          return;
        }
        this.inquiryListOption.data = res.data.rows;
        this.inquiryListOption.page.total = res.data.total;
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
