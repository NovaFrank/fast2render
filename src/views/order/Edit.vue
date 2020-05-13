<template>
  <basic-container>
    <form-header
      titleText="修改"
      showButton
      :buttons="headerButtons"
      @on-cancel="handleCancel"
      @on-submit="handleSubmit"
      @on-save="handleSave"
    ></form-header>
    <!-- <avue-detail ref="form" v-model="formObj" :option="formOption"></avue-detail> -->
    <avue-form :option="formOption.option" v-model="formOption.obj" ref="form">
      <template slot="purchasePerson">
        <el-input v-model="formOption.obj.purchasePerson" :readonly="true">
          <i
            slot="suffix"
            class=" el-input_icon el-icon-search pointer"
            @click="purchaseDialogOpen"
          ></i>
        </el-input>
      </template>
    </avue-form>
    <div class="clear" style="margin-bottom: 30px;"></div>
    <avue-tabs :option="tabOption.option" @change="handleTabClick"></avue-tabs>
    <span v-if="tabActive.prop === 'detail'">
      <avue-crud
        :data="materielListOption.data"
        :option="materielListOption.option"
        v-model="crudObj"
        :page.sync="page"
        @row-save="rowSave"
        @row-update="rowUpdate"
        @row-del="handleDeleteRow"
        ref="crud"
      >
        <template slot="menuLeft">
          <button-group :option="btnOption" @item-add="itemAdd"></button-group>
        </template>
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
        @row-save="rowSavePlan"
        @row-del="rowDelPlan"
        @row-update="rowUpdatePlan"
      >
      </avue-crud>
    </span>
    <span v-if="tabActive.prop === 'files'">
      <!-- <avue-crud :data="fileOption.data" :option="fileOption.option" v-model="filesForm">
      </avue-crud> -->
      <fast2-attachment-list
        :id="formOption.obj.orderNumber"
        :elsAccount="elsAccount"
        :businessElsAccount="formOption.obj.elsAccount"
        :version="annexComponentVersion"
        businessModule="order"
      ></fast2-attachment-list>
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
  </basic-container>
</template>

<script>
import FormHeader from '@/components/formHeader';
import tabOption from '@/const/order/tabs';
import formOption from '@/const/order/detail';
import fileOption from '@/const/order/newFiles';
import purchaseOption from '@/const/order/purchaseList';
import planListOption from '@/const/order/planList';
import materialOption from '@/const/order/materiaList';
import materielListOption from '@/const/order/materielList';
import { getOrderList, getDataDic, createOrder } from '@/api/order.js';
import selectDialog from '@/common/selectDialog';
import selectDialog3 from '@/common/selectDialog3';
import { getUserInfo } from '@/util/utils.js';
export default {
  components: {
    FormHeader,
    selectDialog,
    selectDialog3
  },
  name: 'Detail',
  props: {
    annexComponentVersion: {
      type: String,
      default: () => {
        return 'attahcment-fiels_4_2';
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    isInApproval: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      elsAccount: '',
      elsSubAccount: '',
      inputParamJson: {
        // 业务类型转换传入的值
        itemList: []
      },
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
      materialOption: materialOption,
      purchaseOption: purchaseOption,
      formOption: formOption,
      planListOption: planListOption,
      crudObj: {},
      crudOption: {},
      uploadObj: {},
      uploadData: [],
      uploadCrudOption: {
        dialogDirection: 'rtl',
        dialogType: 'drawer',
        border: true,
        stripe: true,
        page: false,
        addBtn: true,
        align: 'center',
        menuAlign: 'center',
        menuWidth: '180',
        column: [
          {
            label: '文件ID',
            prop: 'profileID'
          },
          {
            label: '创建者',
            prop: 'creator'
          },
          {
            label: '创建人',
            prop: 'createPeople'
          },
          {
            label: '文件类型',
            prop: 'fileType'
          },
          {
            label: '行项目号',
            prop: 'lineNumber'
          }
        ]
      },
      headerButtons: [
        {
          text: '返回',
          type: 'primary',
          size: 'small',
          action: 'on-cancel'
        },
        {
          text: '保存',
          type: 'primary',
          size: 'small',
          action: 'on-save'
        },
        {
          text: '发送',
          type: 'primary',
          size: 'small',
          action: 'on-submit'
        }
      ],
      btnOption: [
        {
          name: 'btn-add',
          label: '添加行',
          size: 'small',
          action: 'item-add',
          align: 'btn-left'
        }
      ]
    };
  },
  async created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.tabActive = this.tabOption.option.column[0];
    this.tableData();
    this.getDicData();
  },
  methods: {
    // 获取数据字典下拉列表
    async getDicData(data) {
      const action = 'orderType';
      const action2 = 'purchaseType';
      const resp = await getDataDic(action);
      const resp2 = await getDataDic(action2);
      this.formOption.option.column[1].dicData = [];
      for (let item of resp.data) {
        const orderTypeList = {};
        orderTypeList.value = item.label;
        this.formOption.option.column[1].dicData.push(orderTypeList);
      }
      this.formOption.option.column[5].dicData = [];
      for (let item of resp2.data) {
        const purchaseTypeList = {};
        purchaseTypeList.value = item.label;
        this.formOption.option.column[5].dicData.push(purchaseTypeList);
      }
    },
    // 获取头数据和行数据findDeliveryPlanList
    async tableData(data) {
      const action = 'findOrderHeadVO';
      const action2 = 'findOrderItemList';
      const action3 = 'findDeliveryPlanList';
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
      let orderItemArr = [];
      resp2.data.data.forEach((i) => {
        orderItemArr.push(Number(i.orderItemNumber));
      });
      sessionStorage.setItem('orderItemArr', JSON.stringify(orderItemArr));
    },
    // 切换表格
    handleTabClick(value) {
      this.tabActive = value;
      console.log(this.tabActive.prop);
      sessionStorage.setItem('materialRow', JSON.stringify(this.materielListOption.data));
      if (this.tabActive.prop === 'plan') {
        let sessionCateCode = sessionStorage.getItem('materialRow');
        this.planListOption.data = JSON.parse(sessionCateCode);
        this.planListOption.data.forEach((item) => {
          JSON.parse(sessionCateCode).forEach((i) => {
            if (i.orderItemNumber === item.orderItemNumber) {
              item.requestDeliveryDate = i.deliveryDate;
              item.requestDeliveryQuantity = i.quantity;
              item.deliveryItemNumber = '1';
            }
          });
        });
      }
    },
    itemAdd() {
      this.$refs.crud.rowAdd();
    },
    // 删除行数据
    handleDeleteRow(row, index) {
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.materielListOption.data.splice(index, 1);
      });
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

    // 保存新增的数据
    rowSave(row, done, loading) {
      if (this.materielListOption.data === undefined) {
        this.materielListOption.data = [];
      }

      if (this.materielListOption.data.length <= 0) {
        row.deliveryItemNumber = '1';
        row.orderItemNumber = '1';
        this.materielListOption.data.push(row);
        this.params.addList.push(row);
      } else {
        row.deliveryItemNumber = '1';
        let sessionItemArr = sessionStorage.getItem('orderItemArr');
        let maxNum = JSON.parse(sessionItemArr).reduce((a, b) => {
          return b > a ? b : a;
        });
        row.orderItemNumber = (maxNum + 1).toString();
        this.materielListOption.data.push(row);
        this.params.addList.push(row);
      }
      done();
    },
    rowSavePlan(row, done, loading) {
      // 保存新增的数据
      if (this.crudPlanData === undefined) {
        this.crudPlanData = [];
      }
      this.crudPlanData.push(row);
      // this.params.addList.push(row);
      done();
    },
    rowUpdate(row, index, done, loading) {
      loading();
      this.$set(this.materielListOption.data, index, row);
      done();
    },
    rowUpdatePlan(row, index, done, loading) {
      loading();
      done();
    },
    rowDelPlan(row, index) {
      // 删除
      this.crudPlanData.splice(index, 1);
      this.params.deleteList.push(row);
    },
    rowDel(row, index) {
      // 删除
      this.crudData.splice(index, 1);
      this.params.deleteList.push(row);
    },
    handleCancel() {
      this.$router.push({ path: '/list' });
    },
    // 保存表头和表单
    async handleSave() {
      this.tabActive = this.tabOption.option.column[2];
      this.handleTabClick(this.tabActive);
      const action = 'updateOrder';
      let params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materielListOption.data,
        deliveryPlanVOList: this.planListOption.data
      };
      console.log('params: ' + JSON.stringify(params.orderItemVOList));
      await createOrder(action, params);
      this.$message({
        type: 'success',
        message: '修改成功!'
      });
      this.$router.push({ path: '/list' });
    },

    // 发送
    async handleSubmit() {
      this.$confirm(`确认发送？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const action = 'sendOrder';
          let params = {
            elsAccount: this.elsAccount,
            elsSubAccount: this.elsSubAccount,
            ...this.formOption.obj,
            orderItemVOList: this.materielListOption.data,
            deliveryPlanVOList: this.planListOption.data
          };
          await createOrder(action, params);
          console.log('params: ' + JSON.stringify(params));
        })
        .then(() => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          });
          this.$router.push({ path: '/list' });
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
</style>
