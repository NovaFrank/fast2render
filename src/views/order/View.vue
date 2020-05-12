<template>
  <basic-container>
    <form-header
      titleText="预览"
      showButton
      :buttons="headerButtons"
      @on-cancel="handleCancel"
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
        @row-save="rowSave"
        @row-update="rowUpdate"
        @row-del="handleDeleteRow"
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
  </basic-container>
</template>

<script>
import FormHeader from '@/components/formHeader';
import tabOption from '@/const/order/tabs';
import formOption from '@/const/order/detail';
import fileOption from '@/const/order/files';
import planListOption from '@/const/order/planList';
import materialOption from '@/const/order/materiaList';
import materielListOption from '@/const/order/materielList';
import { getOrderList, dataDicAPI, createOrder } from '@/api/order.js';
import selectDialog from '@/common/selectDialog';
import { getUserInfo } from '@/util/utils.js';
export default {
  components: {
    FormHeader,
    selectDialog
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
      materialOption: materialOption,
      formOption: formOption,
      planListOption: planListOption,
      crudObj: {},
      crudOption: {},
      headerButtons: [
        {
          text: '返回',
          type: 'primary',
          size: 'small',
          action: 'on-cancel'
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
    this.materielListOption.option.header = false;
    this.materielListOption.option.menu = false;
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

    // 保存表头和表单
    async handleSave() {
      this.tabActive = this.tabOption.option.column[2];
      this.handleTabClick(this.tabActive);
      this.$confirm(`确认提交修改？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const action = 'updateOrder';
          let params = {
            elsAccount: this.elsAccount,
            elsSubAccount: this.elsSubAccount,
            ...this.formOption.obj,
            orderItemVOList: this.materielListOption.data,
            deliveryPlanVOList: this.planListOption.data
          };
          // console.log('params: ' + JSON.stringify(params));
          return createOrder(action, params);
        })
        .then(() => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          });
          this.$router.push({ path: '/list' });
        });
    },

    // 切换表格
    handleTabClick(value) {
      this.tabActive = value;
      console.log(this.tabActive.prop);

      if (this.tabActive.prop === 'plan') {
        this.tableData();
      }
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
    // 发送供方
    async handleSendProvider() {
      this.tabActive = this.tabOption.option.column[2];
      this.handleTabClick(this.tabActive);
      const action = 'sendOrder';
      let params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        ...this.formOption.obj,
        orderItemVOList: this.materielListOption.data,
        deliveryPlanVOList: this.planListOption.data
      };
      // console.log('params: ' + JSON.stringify(params.orderItemVOList));
      await createOrder(action, params);
      this.$message({
        type: 'success',
        message: '发送成功!'
      });
      this.$router.push({ path: '/list' });
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
    handleRelease() {},
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
