<template>
  <basic-container>
    <form-header
      titleText="新建订单"
      showButton
      :buttons="headerButtons"
      @on-cancel="handleCancel"
      @on-submit="handleRelease"
      @on-save="handleSave"
    ></form-header>
    <div class="clear" style="margin-bottom: 30px;"></div>
    <avue-form :option="formOption.option" v-model="formOption.obj" ref="form">
      <template slot="toElsAccount">
        <el-input v-model="formOption.obj.toElsAccount" :readonly="true">
          <i
            slot="suffix"
            class=" el-input_icon el-icon-search pointer"
            @click="supplierDialogOpen"
          ></i>
        </el-input>
      </template>
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
      <avue-form
        :option="fileOption.option"
        v-model="filesForm"
        :upload-before="uploadBefore"
        :upload-after="uploadAfter"
      ></avue-form>
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
    <selectDialog2
      ref="supplierDialog"
      :dialogVisible.sync="dialogSupplierVisible"
      :title="'添加供应商'"
      :column="supplierOption.option.column"
      :elsAccount="elsAccount"
      actionPath="findPageList"
      @save="supplierDialogSave"
    ></selectDialog2>
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
import ButtonGroup from '@/common/ButtonGroup';
import FormHeader from '@/components/formHeader';
import tabOption from '@/const/order/tabs';
import fileOption from '@/const/order/files';
import formOption from '@/const/order/orderForm';
import materielListOption from '@/const/order/materielList';
import materialOption from '@/const/order/materiaList';
import supplierOption from '@/const/order/supplierList';
import purchaseOption from '@/const/order/purchaseList';
import planListOption from '@/const/order/planList';
import selectDialog from '@/common/selectDialog';
import selectDialog2 from '@/common/selectDialog2';
import selectDialog3 from '@/common/selectDialog3';
import { getUserInfo } from '@/util/utils.js';
import { getDataDic, createOrder } from '@/api/order.js';
export default {
  components: {
    FormHeader,
    ButtonGroup,
    selectDialog,
    selectDialog2,
    selectDialog3
  },
  name: 'Detail',
  props: {
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
      tabActive: {},
      dialogVisible: false,
      dialogSupplierVisible: false,
      dialogPurchaseVisible: false,
      tabOption: tabOption,
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
      formOption: formOption,
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
          text: '提交审批',
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
      ],
      materialOption: materialOption,
      supplierOption: supplierOption,
      purchaseOption: purchaseOption,
      planListOption: planListOption
    };
  },
  async created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.materielListOption.data = [];
    this.getDicData();
    this.tabActive = this.tabOption.option.column[0];
    this.formOption.obj.orderStatus = '0';
    this.formOption.obj.sendStatus = '0';
    this.formOption.obj.deliveryStatus = '0';
  },
  methods: {
    // 获取数据字典下拉列表
    async getDicData(data) {
      const action = 'orderType';
      const action2 = 'purchaseType';
      const resp = await getDataDic(action);
      const resp2 = await getDataDic(action2);
      this.formOption.option.column[0].dicData = [];
      for (let item of resp.data) {
        const orderTypeList = {};
        orderTypeList.value = item.label;
        this.formOption.option.column[0].dicData.push(orderTypeList);
      }
      this.formOption.option.column[4].dicData = [];
      for (let item of resp2.data) {
        const purchaseTypeList = {};
        purchaseTypeList.value = item.label;
        this.formOption.option.column[4].dicData.push(purchaseTypeList);
      }
    },
    itemAdd() {
      this.$refs.crud.rowAdd();
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
            }
          });
        });
      }
    },

    handleDeleteRow(row, index) {
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.materielListOption.data.splice(index, 1);
      });
    },

    rowSave(row, done, loading) {
      // 保存新增的数据
      if (this.materielListOption.data === undefined) {
        this.materielListOption.data = [];
      }
      row.deliveryItemNumber = '1';
      if (this.materielListOption.data.length <= 0) {
        row.orderItemNumber = '1';
        this.materielListOption.data.push(row);
        this.params.addList.push(row);
      } else {
        row.orderItemNumber = (this.params.addList.length + 1).toString();
        this.materielListOption.data.push(row);
        this.params.addList.push(row);
      }
      done();
    },
    // onLoadPlan() {
    //   let sessionCateCode = sessionStorage.getItem('materialRow');
    //   console.log('this.params.addList2:' + sessionCateCode);
    // },
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
      console.log(row, index);
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
    handleCancel() {
      this.$router.back();
    },
    // 发送订单
    handleRelease() {
      this.tabActive = this.tabOption.option.column[2];
      this.handleTabClick(this.tabActive);

      this.$confirm('确定发送?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'primary'
      })
        .then(() => {
          const action = 'sendOrder';
          let params = {
            elsAccount: this.elsAccount,
            elsSubAccount: this.elsSubAccount,
            ...this.formOption.obj,
            orderItemVOList: this.materielListOption.data,
            deliveryPlanVOList: this.planListOption.data
          };
          console.log('params: ' + JSON.stringify(params));
          return createOrder(action, params);
        })
        .then(() => {
          this.$message({
            type: 'success',
            message: '发送成功!'
          });
          this.$router.push({ path: '/list' });
        })
        .catch(() => {});
    },

    // 保存
    async handleSave() {
      this.tabActive = this.tabOption.option.column[2];
      this.handleTabClick(this.tabActive);

      this.$confirm('确定保存?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'primary'
      })
        .then(() => {
          const action = 'createOrder';
          let params = {
            elsAccount: this.elsAccount,
            elsSubAccount: this.elsSubAccount,
            ...this.formOption.obj,
            orderItemVOList: this.materielListOption.data,
            deliveryPlanVOList: this.planListOption.data
          };
          console.log('params: ' + JSON.stringify(params));
          return createOrder(action, params);
        })
        .then(() => {
          this.$message({
            type: 'success',
            message: '保存成功!'
          });
          this.$router.push({ path: '/list' });
        })
        .catch(() => {});
      // this.onLoad(this.mainTable.page);
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
    supplierDialogOpen() {
      this.dialogSupplierVisible = true;
    },
    purchaseDialogOpen() {
      this.dialogPurchaseVisible = true;
    },
    materialDialogSave(selectColumns) {
      if (selectColumns.length !== 0) {
        this.crudObj.materialNumber = selectColumns[0].materialNumber;
        this.crudObj.materialDesc = selectColumns[0].materialDesc;
        this.crudObj.materialSpecifications = selectColumns[0].materialSpecifications;
        this.crudObj.baseUnit = selectColumns[0].baseUnit;
      }
    },
    supplierDialogSave(selectColumns) {
      if (selectColumns.length !== 0) {
        this.formOption.obj.toElsAccount = selectColumns[0].toElsAccount;
        this.formOption.obj.toElsAccountName = selectColumns[0].toElsAccountName;
      }
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
.scope-btn {
  color: #409eff;
  cursor: pointer;
}
</style>
