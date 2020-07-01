<template>
  <basic-container>
    <form-header
      titleText="新建订单"
      showButton
      :buttons="headerButtons"
      @on-cancel="handleCancel"
      @on-save="handleSave"
      @on-submit="handleSubmit"
    ></form-header>
    <div class="clear" style="margin-bottom: 30px;"></div>
    <div class="avue-form-box">
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
        <template slot="purchaseGroup">
          <el-input v-model="formOption.obj.purchaseGroup" :readonly="true">
            <i
              slot="suffix"
              class=" el-input_icon el-icon-search pointer"
              @click="purchaseGroupDialogOpen"
            ></i>
          </el-input>
        </template>
      </avue-form>
    </div>

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
          <el-upload
            id="webpicker"
            :show-file-list="false"
            class="upload-box"
            ref="uploadBox"
            :http-request="uploadFile"
            action="/"
          >
            <el-button size="small">导入行数据</el-button>
          </el-upload>
          <el-button size="small" @click="downloadExcelTemp()">下载模版</el-button>
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
    <selectDialog4
      ref="purchaseGroupDialog"
      :dialogVisible.sync="dialogPurchaseGroupVisible"
      :title="'添加采购组'"
      :column="purchaseGroupOption.option.column"
      :elsAccount="elsAccount"
      actionPath="findPageList"
      @save="purchaseGroupDialogSave"
    ></selectDialog4>
  </basic-container>
</template>

<script>
import ButtonGroup from '@/common/ButtonGroup';
import FormHeader from '@/components/formHeader';
import { tabOption4Create } from '@/const/order/tabs';
import fileOption from '@/const/order/newFiles';
import formOption from '@/const/order/orderForm';
import materielListOption from '@/const/order/materielList';
import materialOption from '@/const/order/materiaList';
import supplierOption from '@/const/order/supplierList';
import purchaseOption from '@/const/order/purchaseList';
import purchaseGroupOption from '@/const/order/purchaseGroupList';
import planListOption from '@/const/order/planList';
import selectDialog from '@/common/selectDialog';
import selectDialog2 from '@/common/selectDialog2';
import selectDialog3 from '@/common/selectDialog3';
import selectDialog4 from '@/common/selectDialog4';
import { getUserInfo } from '@/util/utils.js';
import {
  createOrder,
  dataDicAPI,
  uploadServlet,
  submitAudit,
  getPriceDetail
} from '@/api/order.js';
import { format, chain, bignumber } from 'mathjs';
export default {
  components: {
    FormHeader,
    ButtonGroup,
    selectDialog,
    selectDialog2,
    selectDialog3,
    selectDialog4
  },
  name: 'Detail',
  props: {},
  data() {
    return {
      elsAccount: '',
      elsSubAccount: '',
      tabActive: {},
      dialogVisible: false,
      dialogSupplierVisible: false,
      dialogPurchaseVisible: false,
      dialogPurchaseGroupVisible: false,
      tabOption: tabOption4Create,
      fileOption: fileOption,
      purchaseGroupOption: purchaseGroupOption,
      filesForm: {},
      materielListOption: materielListOption,
      taxCodeArr: {},
      params: {
        addList: [],
        updateList: [],
        deleteList: []
      },
      url: '', // 上传路径
      type: {},
      page: {
        // pageSizes: [10, 20, 30, 40],默认
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
      formOption: formOption,
      materialOption: materialOption,
      supplierOption: supplierOption,
      purchaseOption: purchaseOption,
      planListOption: planListOption,
      crudObj: {},
      crudOption: {},
      headerButtons: [
        {
          text: '返回',
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
      ]
    };
  },
  watch: {
    'crudObj.taxCode'(newVal) {
      this.crudObj.taxRate = newVal;
    }
  },
  async created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.materielListOption.data = [];
    this.fileOption.option.menu = true;
    this.tabActive = this.tabOption.option.column[0];
    await this.getDicData();
    this.formOption.obj.orderStatus = '0';
    this.formOption.obj.sendStatus = '0';
    this.formOption.obj.deliveryStatus = '0';
  },
  methods: {
    // 获取数据字典下拉列表
    async getDicData(data) {
      // dataDicAPI('orderType').then((res) => {
      //   this.formOption.option.column = this.formOption.option.column.map((item) => {
      //     if (item.prop === 'orderType') {
      //       return {
      //         ...item,
      //         dicData: res.data
      //       };
      //     }
      //     return item;
      //   });
      // });
      // dataDicAPI('purchaseType').then((res) => {
      //   this.formOption.option.column = this.formOption.option.column.map((item) => {
      //     if (item.prop === 'purchaseType') {
      //       return {
      //         ...item,
      //         dicData: res.data
      //       };
      //     }
      //     return item;
      //   });
      // });
      // 税码
      dataDicAPI('taxRateNo').then((res) => {
        this.materielListOption.option.column = this.materielListOption.option.column.map(
          (item) => {
            if (item.prop === 'taxCode') {
              return {
                ...item,
                dicData: res.data.map((item, index) => {
                  // arr3[key] = { purchase: item.suppliers[index2][key], sale: '', diff: '' };
                  this.taxCodeArr[item.label] = item.value;
                  return {
                    label: `${item.label}`,
                    value: `${item.value}`
                  };
                })
              };
            }
            return item;
          }
        );
      });
    },
    itemAdd() {
      if (!this.formOption.obj.toElsAccount) {
        alert('请选择供应商！');
        return false;
      }
      this.$refs.crud.rowAdd();
    },

    // 切换表格
    handleTabClick(value) {
      this.tabActive = value;
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
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        this.materielListOption.data.splice(index, 1);
      });
    },

    rowSave(row, done, loading) {
      if (this.crudObj.deliveryDate < new Date().getTime()) {
        loading();
        this.$message.error('截止时间不得小于当前时间');
        return false;
      }

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
      const priceString = Number(row.priceIncludingTax).toFixed(2);
      const quantityString = row.quantity.toString();
      const totalAmount = format(
        chain(bignumber(priceString))
          .multiply(bignumber(quantityString))
          .done()
      );

      row.totalAmount = Number(totalAmount).toFixed(2);
      this.$message({
        type: 'success',
        message: '保存成功!'
      });
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
      if (this.crudObj.deliveryDate < new Date().getTime()) {
        loading();
        this.$message.error('截止时间不得小于当前时间');
        return false;
      }
      // loading();
      const data = this.materielListOption.data[index];
      console.log(data);
      const priceString = Number(row.priceIncludingTax).toFixed(2);
      const quantityString = row.quantity.toString();

      const totalAmount = format(
        chain(bignumber(priceString))
          .multiply(bignumber(quantityString))
          .done()
      );

      row.totalAmount = Number(totalAmount).toFixed(2);
      this.$set(this.materielListOption.data, index, row);
      this.$message({
        type: 'success',
        message: '修改成功!'
      });
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
      this.$router.push({ path: '/list' });
    },
    // 提交审批
    async handleSubmit() {
      if (this.materielListOption.data.length === 0) {
        alert('请添加一条数据!');
        return false;
      } else if (this.formOption.obj.orderType === '') {
        alert('请选择订单类型!');
        return false;
      } else if (this.formOption.obj.purchasePerson === '') {
        alert('请选择采购方负责人!');
        return false;
      } else if (this.formOption.obj.purchaseType === '') {
        alert('请选择采购类别!');
        return false;
      } else if (this.formOption.obj.purchaseGroup === '') {
        alert('请选择采购组!');
        return false;
      }
      this.tabActive = this.tabOption.option.column[1];
      this.handleTabClick(this.tabActive);
      const action = 'createOrder';
      let params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materielListOption.data,
        deliveryPlanVOList: this.planListOption.data
      };
      // console.log('params: ' + JSON.stringify(params));
      const res = await createOrder(action, params);
      const orderNo = res.data.data.orderNumber;
      const action2 = 'submit';
      let params2 = {
        elsAccount: this.elsAccount,
        toElsAccount: this.formOption.obj.toElsAccount,
        businessType: 'orderAudit',
        businessId: orderNo,
        params: '{"key1":"123"}'
      };
      await submitAudit(action2, params2);
      this.$message({
        type: 'success',
        message: '已提交审批!'
      });
      this.$router.push({ path: '/list' });
      // this.$router.push({ name: 'edits', params: { orderNumber: orderNo } });
    },

    // 保存 跳转到list
    async handleSave() {
      if (this.materielListOption.data.length === 0) {
        alert('请添加一条数据!');
        return false;
      } else if (this.formOption.obj.orderType === '') {
        alert('请选择订单类型!');
        return false;
      } else if (this.formOption.obj.purchasePerson === '') {
        alert('请选择采购方负责人!');
        return false;
      } else if (this.formOption.obj.purchaseType === '') {
        alert('请选择采购类别!');
        return false;
      } else if (this.formOption.obj.purchaseGroup === '') {
        alert('请选择采购组!');
        return false;
      }
      this.tabActive = this.tabOption.option.column[1];
      this.handleTabClick(this.tabActive);
      const action = 'createOrder';
      let params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materielListOption.data,
        deliveryPlanVOList: this.planListOption.data
      };
      // console.log('params: ', params);
      await createOrder(action, params);
      this.$message({
        type: 'success',
        message: '保存成功!'
      });
      this.$router.push({ path: '/list' });
    },
    // 添加附件 保存跳转到list
    async handleFile() {
      if (this.materielListOption.data.length === 0) {
        alert('请添加一条数据！');
        return false;
      } else if (this.formOption.obj.orderType === '') {
        alert('请选择订单类型!');
        return false;
      } else if (this.formOption.obj.purchasePerson === '') {
        alert('请选择采购方负责人!');
        return false;
      } else if (this.formOption.obj.purchaseType === '') {
        alert('请选择采购类别!');
        return false;
      } else if (this.formOption.obj.purchaseGroup === '') {
        alert('请选择采购组!');
        return false;
      }
      this.tabActive = this.tabOption.option.column[1];
      this.handleTabClick(this.tabActive);
      const action = 'createOrder';
      let params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materielListOption.data,
        deliveryPlanVOList: this.planListOption.data
      };
      const res = await createOrder(action, params);
      this.$message({
        type: 'success',
        message: '保存成功!'
      });
      const orderNo = res.data.data.orderNumber;
      this.$router.push({ name: 'edits', params: { orderNumber: orderNo } });
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
    purchaseGroupDialogOpen() {
      this.dialogPurchaseGroupVisible = true;
    },
    async materialDialogSave(selectColumns) {
      this.crudObj = {};
      this.crudObj.priceIncludingTax = '';
      if (selectColumns.length !== 0) {
        this.crudObj.materialNumber = selectColumns[0].materialNumber;
        this.crudObj.materialDesc = selectColumns[0].materialDesc;
        this.crudObj.materialSpecifications = selectColumns[0].materialSpecifications;
        this.crudObj.baseUnit = selectColumns[0].baseUnit;
        // this.crudObj.priceIncludingTax = selectColumns[0].priceIncludingTax;
        // this.crudObj.taxRate = selectColumns[0].taxRate;
        const action = 'getToElsEffectivePrice';
        let params = {
          elsAccount: this.elsAccount,
          toElsAccount: this.formOption.obj.toElsAccount,
          materialNumber: selectColumns[0].materialNumber
        };
        // console.log('params: ' + JSON.stringify(params));
        let res = await getPriceDetail(action, params);
        if (res.data.data !== null) {
          this.crudObj.priceIncludingTax = res.data.data.priceIncludingTax;
          this.crudObj.taxRate = res.data.data.taxRate;
        }

        this.crudObj.queryUuid = selectColumns[0].uuid;
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
    },
    purchaseGroupDialogSave(selectColumns) {
      if (selectColumns.length !== 0) {
        this.formOption.obj.purchaseGroup = selectColumns[0].orgCategoryDesc;
      }
    },
    handleDeliveryDate(val) {
      this.deliveryDateChange = val;
    },
    // 下载excel模板
    downloadExcelTemp() {
      window.open(`https://cs.51qqt.com/ELSServer_SRM/temple/order_item.xls`);
    },
    async uploadFile(myfile) {
      if (!this.formOption.obj.toElsAccount) {
        alert('请选择供应商！');
        return false;
      }
      const formdata = new FormData();
      formdata.append('file', myfile.file);
      await uploadServlet(formdata)
        .then(async (res) => {
          if (res.data.statusCode === '200') {
            let data = res.data.data[0];
            const file = {
              fileSize: data.size,
              fileName: data.name,
              fileType: data.type,
              filePath: data.url
            };
            this.$emit('upload-file', file);
            // this.updateFileList(file);
            const action = 'importExcel';
            let params = {
              elsAccount: this.elsAccount,
              urlStr: data.url,
              taxMap: this.taxCodeArr
            };
            // console.log('params: ' + JSON.stringify(params));
            let newRow = await createOrder(action, params);
            // console.log('newRow:' + JSON.stringify(newRow));

            if (this.materielListOption.data.length <= 0) {
              this.materielListOption.data.push(newRow.data.data[0]);
              this.params.addList.push(newRow.data.data[0]);
              this.materielListOption.data[0].orderItemNumber = '1';
              this.materielListOption.data[0].deliveryItemNumber = '1';
            } else {
              this.materielListOption.data.push(newRow.data.data[0]);
              this.materielListOption.data[this.params.addList.length].orderItemNumber = (
                this.params.addList.length + 1
              ).toString();
              this.materielListOption.data[0].deliveryItemNumber = '1';
              this.params.addList.push(newRow.data.data[0]);
            }
          } else {
            this.$message.error('上传失败');
          }
        })
        .catch(() => {
          this.$message.error('上传失败');
        });
    }
  }
};
</script>

<style scoped lang="scss">
.avue-crud {
  width: 100%;
}
.avue-tabs {
  padding: 0;
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
#webpicker {
  display: inline-block;
}
.btns-right {
  display: inline;
}
</style>
