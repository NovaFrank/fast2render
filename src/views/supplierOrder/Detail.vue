<template>
  <basic-container>
    <form-header
      titleText="未确认订单预览"
      showButton
      :buttons="headerButtons"
      @on-submit="handleRelease"
      @on-save="handleSave"
    ></form-header>
    <!-- <avue-detail ref="form" v-model="formObj" :option="formOption"></avue-detail> -->
    <avue-form :option="formOption.option" v-model="formOption.obj" ref="form"> </avue-form>
    <div class="clear" style="margin-bottom: 30px;"></div>
    <avue-tabs :option="tabOption.option" @change="handleTabClick"></avue-tabs>
    <span v-if="tabActive.prop === 'detail'">
      <avue-crud
        :data="materielListOption.data"
        :option="materielListOption.option"
        v-model="crudObj"
        :page.sync="page"
        ref="crud"
      >
        <template slot="materialNumberForm">
          <el-input v-model="crudObj.materialNumber" :readonly="true">
            <i
              slot="suffix"
              class=" el-input_icon el-icon-search pointer"
              @click="materialDialogOpen"
            ></i>
          </el-input>
        </template>
      </avue-crud>
    </span>
    <span v-if="tabActive.prop === 'plan'">
      <avue-crud
        :data="planListOption.data"
        :option="planListOption.option"
        v-model="planListOption.planObj"
        :page.sync="planListOption.page"
        @row-update="rowUpdatePlan"
      >
      </avue-crud>
    </span>
    <span v-if="tabActive.prop === 'files'">
      <avue-crud :data="fileOption.data" :option="fileOption.option" v-model="filesForm">
      </avue-crud>
    </span>
    <selectDialog
      ref="materialDialog"
      :dialogVisible.sync="dialogVisible"
      :title="'添加物料'"
      :column="materialOption.option.column"
      :elsAccount="elsAccount"
      actionPath="findPageList"
      @save="materialDialogSave"
    ></selectDialog>
    <selectDialog3
      ref="purchaseDialog"
      :dialogVisible.sync="dialogPurchaseVisible"
      :title="'添加采购方负责人'"
      :column="purchaseOption.option.column"
      :elsAccount="elsAccount"
      actionPath="findPageList"
      @save="purchaseDialogSave"
    ></selectDialog3>
    <el-dialog title="退回原因" :visible.sync="dialogRejecctVisible" width="30%">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item label="" prop="name">
          <textarea
            v-model="ruleForm.rejectObj"
            cols="30"
            rows="10"
            class="reject-textarea"
          ></textarea>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogRejecctVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRejectReason('ruleForm')">确 定</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
import FormHeader from '@/components/formHeader';
import tabOption from '@/const/supplierOrder/tabs';
import formOption from '@/const/supplierOrder/detail';
import fileOption from '@/const/supplierOrder/files';
import purchaseOption from '@/const/supplierOrder/purchaseList';
import planListOption from '@/const/supplierOrder/planEdit';
import materialOption from '@/const/supplierOrder/materiaList';
import materielListOption from '@/const/supplierOrder/materielList';
import { getOrderList, createOrder, dataDicAPI } from '@/api/supplierOrder.js';
import selectDialog from '@/common/selectDialog';
import selectDialog3 from '@/common/selectDialog3';
import { getSupplierInfo } from '@/util/utils.js';
export default {
  components: {
    FormHeader,
    selectDialog,
    selectDialog3
  },
  name: 'Detail',
  props: {},
  data() {
    return {
      elsAccount: '',
      elsSubAccount: '',
      tabOption: tabOption,
      tabActive: {},
      fileOption: fileOption,
      filesForm: {},
      materielListOption: materielListOption,
      params: {
        addList: [],
        updateList: [],
        deleteList: []
      },
      url: '', // 上传路径
      type: {},
      downloadMessage: '',
      page: {
        // pageSizes: [10, 20, 30, 40],默认
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
      dialogVisible: false,
      dialogPurchaseVisible: false,
      dialogRejecctVisible: false,
      materialOption: materialOption,
      purchaseOption: purchaseOption,
      formOption: formOption,
      planListOption: planListOption,
      crudObj: {},
      crudOption: {},
      ruleForm: {
        rejectObj: ''
      },
      rules: {
        rejectObj: [
          { required: true, message: '请输入退回原因', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 50个字符以内', trigger: 'blur' }
        ]
      },
      headerButtons: [
        {
          text: '确认',
          type: 'primary',
          size: 'small',
          action: 'on-save'
        },
        {
          text: '退回',
          type: 'primary',
          size: 'small',
          action: 'on-submit'
        }
      ]
    };
  },
  async created() {
    const userInfo = getSupplierInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.tabActive = this.tabOption.option.column[0];
    this.tableData();
    this.getDicData();
    this.formOption.option.detail = true;
  },
  methods: {
    async getDicData(data) {
      dataDicAPI('orderType').then((res) => {
        this.formOption.option.column = this.formOption.option.column.map((item) => {
          if (item.prop === 'orderType') {
            return {
              ...item,
              dicData: res.data
            };
          }
          return item;
        });
      });
      dataDicAPI('purchaseType').then((res) => {
        this.formOption.option.column = this.formOption.option.column.map((item) => {
          if (item.prop === 'purchaseType') {
            return {
              ...item,
              dicData: res.data
            };
          }
          return item;
        });
      });
    },

    // 获取头数据和行数据
    async tableData(data) {
      const action = 'findOrderHeadReceiveVO';
      const action2 = 'findOrderItemReceiveList';
      const action3 = 'findDeliveryPlanReceiveList';
      const params = {
        elsAccount: this.$route.params && this.$route.params.id.split('_')[1],
        orderStatus: '',
        orderNumber: this.$route.params && this.$route.params.id.split('_')[0],
        ...data
      };
      const params2 = {
        elsAccount: this.$route.params && this.$route.params.id.split('_')[1],
        orderStatus: '',
        orderNumber: this.$route.params && this.$route.params.id.split('_')[0],
        ...data
      };
      const params3 = {
        elsAccount: this.$route.params && this.$route.params.id.split('_')[1],
        orderStatus: '',
        orderNumber: this.$route.params && this.$route.params.id.split('_')[0],
        ...data
      };
      const resp = await getOrderList(action, params);
      const resp2 = await getOrderList(action2, params2);
      const resp3 = await getOrderList(action3, params3);
      this.formOption.obj = resp.data.data;
      this.materielListOption.data = resp2.data.data;
      this.planListOption.data = resp3.data.data;
      this.formOption.obj.salePerson = '1001';
    },
    rowUpdatePlan(row, index, done, loading) {
      loading();
      this.$set(this.planListOption.data, index, row);
      done();
    },
    // 确认订单
    async handleSave() {
      this.$confirm(`确认提交？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const action = 'updateOrder';
          let params = {
            elsAccount: this.elsAccount,
            ...this.formOption.obj,
            orderItemReceiveVOList: this.materielListOption.data,
            deliveryPlanReceiveVOList: this.planListOption.data
          };
          return createOrder(action, params);
        })
        .then(() => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          });
          this.$router.push({ path: '/supplier/orderList' });
        });
    },
    saveRejectReason(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.formOption.obj.rejectReason = this.ruleForm.rejectObj;
          const action = 'backToOrder';
          let params = {
            elsAccount: this.elsAccount,
            ...this.formOption.obj,
            orderItemReceiveVOList: this.materielListOption.data,
            deliveryPlanReceiveVOList: this.planListOption.data
          };
          await createOrder(action, params);

          this.$message({
            type: 'success',
            message: '退回成功!'
          });
          this.$router.push({ path: '/supplier/orderList' });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    // 退回订单
    async handleRelease() {
      this.dialogRejecctVisible = true;
    },
    // 切换表格
    handleTabClick(value) {
      this.tabActive = value;
    },
    // 生成excel模板
    generateExcelTemp() {
      // todo
    },
    // 下载excel模板
    downloadExcelTemp() {
      window.open(
        `https://cs.51qqt.com/qqt-srm/servlet/downloadServlet?filePath=${this.downloadMessage}`
      );
    },
    // 导入excel
    async beforeUploadExcel(file) {
      console.log('file.raw :', file);
    },

    handleCancel() {
      this.$router.push({ path: '/supplier/orderList' });
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
    },
    onSaveForm(form) {
      // todo
    },
    materialDialogOpen() {
      this.dialogVisible = true;
    },
    materialDialogSave(selectColumns) {
      if (selectColumns.length !== 0) {
        this.crudObj.materialNumber = selectColumns[0].materialNumber;
        this.crudObj.materialDesc = selectColumns[0].materialDesc;
        this.crudObj.materialSpecifications = selectColumns[0].materialSpecifications;
        this.crudObj.baseUnit = selectColumns[0].baseUnit;
      }
    },
    purchaseDialogOpen() {
      this.dialogPurchaseVisible = true;
    },
    purchaseDialogSave(selectColumns) {
      if (selectColumns.length !== 0) {
        this.formOption.obj.purchasePerson =
          selectColumns[0].elsSubAccount + '_' + selectColumns[0].name;
      }
    }
  }
};
</script>

<style scoped lang="scss">
.avue-crud {
  width: 100%;
}
.form-header {
  display: flex;
  height: 80px;
  line-height: 80px;
}
.form-title {
  margin: 0px 20px;
  font-size: 20px;
  font-weight: bold;
}
.form-buttons {
  position: absolute;
  right: 20px;
}
.reject-textarea {
  width: 100%;
}
</style>
