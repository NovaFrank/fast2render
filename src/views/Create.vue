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
    <avue-crud
      v-if="tabActive === 'detail'"
      :data="crudData"
      :option="materielListOption.option"
      v-model="crudObj"
      :page.sync="page"
      @row-save="rowSave"
      @row-del="rowDel"
      @row-update="rowUpdate"
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
      <template slot-scope="scope" slot="menu">
        <el-row :gutter="24">
          <el-col :span="12">
            <a class="scope-btn" @click.stop="handleAddShow(scope.row)">
              编辑
            </a>
          </el-col>
          <el-col :span="12">
            <a class="scope-btn">
              删除
            </a>
          </el-col>
        </el-row>
      </template>
    </avue-crud>
    <avue-crud
      v-if="tabActive === 'plan'"
      :data="planListOption.data"
      :option="planListOption.option"
      v-model="planListOption.planObj"
      :page.sync="planListOption.page"
      @row-save="rowSavePlan"
      @row-del="rowDelPlan"
      @row-update="rowUpdatePlan"
      ref="crud"
    >
    </avue-crud>
    <avue-form
      v-if="tabActive === 'files'"
      :option="fileOption.option"
      v-model="filesForm"
      :upload-before="uploadBefore"
      :upload-after="uploadAfter"
    ></avue-form>
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
import { getDataDic } from '@/api/order.js';
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
      inputParamJson: {
        // 业务类型转换传入的值
        itemList: []
      },
      dialogVisible: false,
      dialogSupplierVisible: false,
      dialogPurchaseVisible: false,
      tabOption: tabOption,
      tabActive: 'detail',
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
      tableCode: '',
      formColumn: [],
      tableColumn: [],
      orderNumberValue: '',
      orderTypeValue: '', // 订单类型的值
      purchasePersonValue: '',
      elsAccountNameValue: '',
      purchaseTypeValue: '',
      purchaseGroupValue: '',
      dicData: [
        {
          fieldValue: 1,
          fieldValueText: '测试一'
        },
        {
          fieldValue: 2,
          fieldValueText: '测试二'
        }
      ], // 订单类型选项
      selectDisabled: false, // 编辑时进入，select不能更改
      purchaseRequestNumber: '', // 采购申请号
      page: {
        // pageSizes: [10, 20, 30, 40],默认
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
      formObj: {},
      formOption: formOption,
      crudObj: {},
      crudData: [],
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
          text: '提交',
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
    this.getDicData();
  },
  methods: {
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
    // 保存表头和表单
    itemSave() {
      this.$confirm(`确认添加？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.formObj.requestType = this.orderTypeValue;
          this.$refs.form.validate((vaild) => {
            if (vaild) {
              this.$message.success(JSON.stringify(this.obj0));
            } else {
              return false;
            }
          });
          console.log('this.formObj :', this.formObj);
        })
        .then(() => {
          this.selectChange(this.orderTypeValue);
          this.$message.success('保存成功');
        });
    },
    // 切换表格
    handleTabClick(value) {
      this.tabActive = value.prop;
    },
    handleAddShow(row) {
      this.$refs.crud.rowEdit(row);
    },
    // 选择申请类型的值后触发接口
    async selectChange(value) {
      // this.fetchConfig(); // 防止没有配置的选项，form表单显示的是之前的表单配置
    },
    fechList(page, purchaseRequestNumber) {
      // this.crudData = res.data.purchaseRequestItemVOs;
      // this.page.total = res.data.total;
      // todo 需要获取sesstion的值来赋值给formObj
      // this.formObj = res.data;
    },
    rowSave(row, done, loading) {
      // 保存新增的数据
      if (this.crudData === undefined) {
        this.crudData = [];
      }
      this.crudData.push(row);
      this.params.addList.push(row);
      done();
    },
    rowSavePlan(row, done, loading) {
      // 保存新增的数据
      if (this.crudPlanData === undefined) {
        this.crudPlanData = [];
      }
      this.crudPlanData.push(row);
      this.params.addList.push(row);
      done();
    },
    rowUpdate(form, index, done, loading) {
      loading();
      done();
    },
    rowUpdatePlan(form, index, done, loading) {
      loading();
      done();
    },
    rowDel(row, index) {
      // 删除
      this.crudData.splice(index, 1);
      this.params.deleteList.push(row);
    },
    rowDelPlan(row, index) {
      // 删除
      this.crudPlanData.splice(index, 1);
      this.params.deleteList.push(row);
    },
    handleCancel() {
      this.$router.back();
    },
    handleRelease() {},
    handleSave() {},
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
        this.formOption.obj.supplierName = selectColumns[0].supplierName;
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
