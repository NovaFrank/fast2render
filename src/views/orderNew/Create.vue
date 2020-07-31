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
    <fast2-head-provider
      :elsAccountStation="elsAccountStation"
      ref="head"
      status="new"
      :businessModule="businessModule"
      :originColumn.sync="originHeadColumn"
      :data.sync="formOption.obj"
      @updateType="setTableColumns"
    ></fast2-head-provider>

    <avue-tabs :option="tabOption.option" @change="handleTabClick"></avue-tabs>
    <span v-if="tabActive.prop === 'detail'">
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
      <fast2-row-provider
        :rowPermission="rowPermission"
        :option.sync="materialListOption.option"
        ref="crud"
        :addBtn="false"
        :page.sync="page"
        v-model="materialListOption.obj"
        :data.sync="materialListOption.data"
        :originColumn.sync="originColumn"
        @handleAddShow="handleAddShow"
        @row-update="rowUpdate"
        @row-del="handleDeleteRow"
      >
      </fast2-row-provider>
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
  </basic-container>
</template>

<script>
import ButtonGroup from '@/common/ButtonGroup';
import FormHeader from '@/components/formHeader';
import { tabOption4Create } from '@/const/order/tabs';
import fileOption from '@/const/order/newFiles';
import formOption from '@/const/order/orderForm';
import materialListOption from '@/const/order/materielList';
import materialOption from '@/const/order/materiaList';
import supplierOption from '@/const/order/supplierList';
import purchaseOption from '@/const/order/purchaseList';
import purchaseGroupOption from '@/const/order/purchaseGroupList';
import factoryGroupOption from '@/const/order/factoryGroupList';
import planListOption from '@/const/order/planList';
import { getUserInfo } from '@/util/utils.js';
import {
  createOrder,
  // dataDicAPI,
  uploadServlet,
  submitAudit,
  getPriceDetail
} from '@/api/order.js';
import { format, chain, bignumber } from 'mathjs';
export default {
  components: {
    FormHeader,
    ButtonGroup
  },
  name: 'Detail',
  props: {},
  data() {
    return {
      elsAccount: '',
      elsSubAccount: '',
      tabActive: {},
      elsAccountStation: '',
      businessModule: 'order',
      blockVersion: 'fullfield-order',
      dialogVisible: false,
      dialogSupplierVisible: false,
      dialogPurchaseVisible: false,
      dialogPurchaseGroupVisible: false,
      dialogFactoryGroupVisible: false,
      tabOption: tabOption4Create,
      fileOption: fileOption,
      purchaseGroupOption: purchaseGroupOption,
      filesForm: {},
      materialListOption: materialListOption,
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
      factoryGroupOption: factoryGroupOption,
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
    this.elsAccountStation = userInfo.infoVO.station;
    this.materialListOption.data = [];
    this.fileOption.option.menu = true;
    this.materialListOption.option.header = true;
    this.materialListOption.option.menu = true;
    this.tabActive = this.tabOption.option.column[0];
    this.formOption.obj.orderStatus = '0';
    this.formOption.obj.sendStatus = '0';
    this.formOption.obj.deliveryStatus = '0';
    this.getOragin();
  },
  methods: {
    // 获取数据字典下拉列表
    itemAdd() {
      // if (!this.formOption.obj.toElsAccount) {
      //   alert('请选择供应商！');
      //   return false;
      // }
      this.$refs.crud.addEmptyRow();
    },

    // 切换表格
    handleTabClick(value) {
      this.tabActive = value;
      sessionStorage.setItem('materialRow', JSON.stringify(this.materialListOption.data));
      if (this.tabActive.prop === 'plan') {
        const sessionCateCode = sessionStorage.getItem('materialRow');
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
        this.materialListOption.data.splice(index, 1);
      });
    },

    async getOragin() {
      const config = await this.$getBlockItem(this.blockVersion);
      this.originColumn = config[1].data.column;
      this.originHeadColumn = config[0].data.column;
    },

    rowSave(row, done, loading) {
      if (this.crudObj.deliveryDate < new Date().getTime()) {
        loading();
        this.$message.error('截止时间不得小于当前时间');
        return false;
      }

      // 保存新增的数据
      if (this.materialListOption.data === undefined) {
        this.materialListOption.data = [];
      }
      row.deliveryItemNumber = '1';
      if (this.materialListOption.data.length <= 0) {
        row.orderItemNumber = '1';
        this.materialListOption.data.push(row);
        this.params.addList.push(row);
      } else {
        row.orderItemNumber = (this.params.addList.length + 1).toString();
        this.materialListOption.data.push(row);
        this.params.addList.push(row);
      }
      const priceString = Number(row.priceIncludingTax).toFixed(2);
      const quantityString = row.quantity.toString();
      const totalAmount = format(
        chain(bignumber(priceString)).multiply(bignumber(quantityString)).done()
      );
      row.totalAmount = totalAmount;
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
      const data = this.materialListOption.data[index];
      console.log(data);
      const priceString = Number(row.priceIncludingTax).toFixed(2);
      const quantityString = row.quantity.toString();

      const totalAmount = format(
        chain(bignumber(priceString)).multiply(bignumber(quantityString)).done()
      );

      row.totalAmount = totalAmount;
      this.$set(this.materialListOption.data, index, row);
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
    handleAddShow(title, row) {
      this.checkForm(this.$refs.crud.addEmptyRow, () => {
        // this.$message.warning('添加物料明细前请先填写必填表单!');
      });
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
      if (this.materialListOption.data.length === 0) {
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
      const params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materialListOption.data,
        deliveryPlanVOList: this.planListOption.data
      };
      // console.log('params: ' + JSON.stringify(params));
      const res = await createOrder(action, params);
      const orderNo = res.data.data.orderNumber;
      const action2 = 'submit';
      const params2 = {
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
      if (this.materialListOption.data.length === 0) {
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
      const params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materialListOption.data,
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
      if (this.materialListOption.data.length === 0) {
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
      const params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materialListOption.data,
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
        const action = 'getToElsEffectivePrice';
        const params = {
          elsAccount: this.elsAccount,
          toElsAccount: this.formOption.obj.toElsAccount,
          materialNumber: selectColumns[0].materialNumber
        };
        // console.log('params: ' + JSON.stringify(params));
        const res = await getPriceDetail(action, params);
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
        this.formOption.obj.purchaseGroup = selectColumns[0].orgId;
      }
    },
    factoryGroupDialogOpen() {
      this.dialogFactoryGroupVisible = true;
    },
    factoryGroupDialogSave(selectColumns) {
      if (selectColumns.length !== 0) {
        this.formOption.obj.purchaseFactory = selectColumns[0].orgId;
      }
    },
    setTableColumns(configObj) {
      if (!configObj) {
        return;
      }
      this.materialListOption.data = [];
      const configuration = configObj;
      const tableColumns = configuration.tableColumns;
      const tablePermission = configuration.tablePermission || {};

      this.resetCrud(tableColumns, tablePermission);
    },
    resetCrud(columns, tablePermission) {
      this.$nextTick(() => {
        this.materialListOption.obj = {};
        this.materialListOption.option.column = columns;
        this.rowPermission = tablePermission;
      });
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
            const data = res.data.data[0];
            const file = {
              fileSize: data.size,
              fileName: data.name,
              fileType: data.type,
              filePath: data.url
            };
            this.$emit('upload-file', file);
            // this.updateFileList(file);
            const action = 'importExcel';
            const params = {
              elsAccount: this.elsAccount,
              urlStr: data.url,
              taxMap: this.taxCodeArr
            };
            // console.log('params: ' + JSON.stringify(params));
            const newRow = await createOrder(action, params);
            if (newRow.data.statusCode === '200') {
              if (this.materialListOption.data.length <= 0) {
                this.materialListOption.data.push(newRow.data.data[0]);
                this.params.addList.push(newRow.data.data[0]);
                this.materialListOption.data[0].orderItemNumber = '1';
                this.materialListOption.data[0].deliveryItemNumber = '1';
              } else {
                this.materialListOption.data.push(newRow.data.data[0]);
                this.materialListOption.data[this.params.addList.length].orderItemNumber = (
                  this.params.addList.length + 1
                ).toString();
                this.materialListOption.data[0].deliveryItemNumber = '1';
                this.params.addList.push(newRow.data.data[0]);
              }
            } else {
              this.$message({
                type: 'error',
                message: newRow.data.message
              });
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
