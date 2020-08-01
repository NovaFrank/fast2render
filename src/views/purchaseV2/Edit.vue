<template>
  <div class="detail-box">
    <page-detail-header
      title="订单信息"
      :buttons="headerButtons"
      @itemBack="handleCancel"
      @do-action="doBtnAction"
    ></page-detail-header>
    <div class="avue-form-box">
      <fast2-head-provider
        v-if="uuid"
        ref="head"
        status="detail"
        :businessModule="businessModule"
        :businessTypeProperty="businessTypeProperty"
        :data.sync="primaryTableData"
        :elsAccountStation="elsAccountStation"
        :originColumn.sync="originHeadColumn"
        :readOnly="true"
        @updateType="setTableColumns"
      ></fast2-head-provider>
    </div>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <!-- tab - 物料明细 -->
    <fast2-row-provider
      ref="crud"
      v-if="tabActive === 'materials' && crudTableConfig.visible"
      :before-open="handleBeforeOpenRequestEditor"
      :data.sync="materialListOption.data"
      :option.sync="materialListOption.option"
      :originColumn.sync="originColumn"
      :rowPermission="rowPermission"
      @handleAddShow="handleAddShow"
    >
    </fast2-row-provider>

    <div v-if="tabActive === 'plan'">
      <avue-crud
        :data="planListOption.data"
        :option="planListOption.option"
        v-model="planListOption.planObj"
        :page.sync="planListOption.page"
        @row-del="planRowDel"
        @row-save="planRowSave"
        @row-update="planRowUpdate"
      >
      </avue-crud>
    </div>

    <el-dialog
      title="下面的物料已添加到物料明细列表，请检查"
      :visible.sync="existsMaterials.visible"
      :modal="false"
      id="existsMaterialsDlg"
    >
      <avue-crud
        v-if="existsMaterials.visible === true"
        :data="existsMaterials.data"
        :option="existsMaterials.option"
        v-model="existsMaterials.obj"
      ></avue-crud>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="existsMaterials.visible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  BLOCK_VERSION,
  BUSINESS_MODULE,
  BUSINESS_TYPE,
  BUSINESS_TYPE_PROPERTY,
  OPERATION,
  ROUTER_PATH_ORDER_V2
} from '@/const/index';

import {
  MATERIAL_COLUMN_ITEMS as DEFAULT_COLUMN_ITEMS,
  MATERIAL_LIST_OPTION
} from '@/config/purchase/formOption.js';

import { createTabOption } from '@/config/purchase/tabs';
import { existsMaterials } from '@/config/purchase/existsMaterials';

import planListOption from '@/const/order/planList';

import { getUserInfo } from '@/util/utils';
import { setStore } from '@/util/store.js';

import { PurchaseOrderService } from '@/api/order.js';

import commonApi from 'fast2render/packages/lib/api/index';

export default {
  data() {
    return {
      originColumn: [],
      originHeadColumn: [],
      businessModule: BUSINESS_MODULE,
      businessTypeProperty: BUSINESS_TYPE_PROPERTY,
      blockVersion: BLOCK_VERSION,

      elsAccount: '',
      elsSubAccount: '',
      elsAccountStation: '',

      orderNumber: '',
      orderStatus: '',
      uuid: '',

      flowId: '',

      businessType: '',

      headerButtons: [
        /*
        {
          order: 2,
          name: 'btn-submit',
          label: '发布',
          icon: 'el-icon-position',
          size: 'small',
          disabled: false,
          round: false,
          type: 'sucescss',
          action: 'handleRelease',
          align: 'btn-right',
          class: ''
        },
        {
          name: 'btn-submit',
          label: '提交审批',
          icon: 'el-icon-position',
          size: 'small',
          disabled: false,
          round: false,
          type: 'sucescss',
          action: 'primary',
          align: 'btn-right',
          class: ''
        },
        */
        {
          name: 'btn-save',
          label: '保存',
          icon: 'el-icon-position',
          size: 'small',
          disabled: false,
          round: false,
          type: 'primary',
          action: 'handleSave',
          align: 'btn-right',
          class: ''
        }
      ],

      formSlots: [],
      // formOption: JSON.parse(JSON.stringify(formOption)),

      tabActive: 'materials',
      tabOption: createTabOption,

      materialListOption: JSON.parse(JSON.stringify(MATERIAL_LIST_OPTION)),

      rowPermission: {},
      tablePermission: {},
      contractTypeDicts: [],

      formObj: {
        requestType: '',
        businessType: '',
        projectType: '',
        startingPrice: ''
      },
      formBasic: {},
      filesForm: {},
      fieldDialogForm: {
        materials: []
      },
      defaultFormValue: {},
      isSetConfigForm: true,

      primaryTableData: {},
      tableData: [],
      enableAnnexEdit: false,
      deletedList: [],
      materialListProps: {},
      currentRow: {},

      opreation: '',

      existsMaterials: existsMaterials,

      planListOption: planListOption,

      crudTableConfig: {
        visible: true,
        page: {
          currentPage: 1,
          total: 0,
          pageSize: 10
        }
      },

      configurations: {},
      existColumnProps: {},
      showColumnProps: null
    };
  },
  async created() {
    this.initParams();
    this.getOragin();

    await this.setUserAccountInfo();
    debugger;
    this.loadPrimaryTableData();
    this.loadTableData();
  },
  methods: {
    doBtnAction(action) {
      this[action]();
    },

    handleProjectTypeChange(projectTypeValue) {
      // debugger;
    },

    initParams() {
      this.orderNumber = this.$route.params.orderNumber;
    },

    async getOragin() {
      const config = await this.$getBlockItem(this.blockVersion);
      this.originColumn = config[1].data.column;
      this.originHeadColumn = config[0].data.column;
    },

    // set user info
    setUserAccountInfo() {
      const userInfo = getUserInfo();

      this.elsAccount = userInfo.elsAccount;
      this.elsSubAccount = userInfo.elsSubAccount;
      this.elsAccountStation = userInfo.infoVO.station;
    },

    loadPrimaryTableData() {
      const params = {
        elsAccount: this.elsAccount,
        orderNumber: this.orderNumber
      };

      PurchaseOrderService.detailPrimaryTable(params)
        .then((res) => {
          if (
            res.data &&
            res.data.statusCode === '200' &&
            res.data.message === 'response OK' &&
            res.data.data
          ) {
            const data = res.data.data;

            this.orderNumber = data.orderNumber;
            this.orderStatus = data.orderStatus;
            this.uuid = data.uuid;

            this.primaryTableData = data;

            this.flowId = data.flowId;

            const flowData = {
              flowId: data.flowId || '',
              businessType: BUSINESS_TYPE
            };

            setStore({ name: data.orderNumber, content: flowData, type: true });
          } else {
            console.log('detail purchase order primary table data fail', res.data);
            this.$message.error('查询订单主表数据失败, ' + res.data.message || '');
          }
        })
        .catch((err) => {
          console.log('detail purchase order primary table data  error', err);
          this.$message.error('查询订单主表数据失败, ' + err.message || '');
        });
    },

    loadTableData() {
      this.deletedList = [];

      const params = {
        elsAccount: this.elsAccount,
        orderNumber: this.orderNumber
      };

      PurchaseOrderService.detailTable(params)
        .then((res) => {
          if (
            res.data &&
            res.data.statusCode === '200' &&
            res.data.message === 'response OK' &&
            res.data.data
          ) {
            const data = res.data.data.rows || [];

            for (const row of data) {
              row.id = row.uuid;
            }

            this.tableData = data;
            this.materialListOption.data = data;
          } else {
            console.log('detail purchase order table data fail', res.data);
            this.$message.error('查询订单详细数据失败, ' + res.data.message || '');
          }
        })
        .catch((err) => {
          console.log('detail purchase order table data error', err);
          this.$message.error('查询订单详细数据失败, ' + err.message || '');
        });
    },

    rowDeleteMaterialList(row, index) {
      this.materialListOption.data.splice(index, 1);
    },

    rowUpdateMaterialList(row, index, done, loading) {
      const data = this.materialListOption.data[index];

      if (row.queryUuid) {
        data.queryUuid = row.queryUuid;
      }

      data.materialName = row.materialName || '';
      data.materialDesc = row.materialDesc || '';
      data.materialSpecifications = row.materialSpecifications;
      data.baseUnit = row.baseUnit;

      // const budgetPriceString = Number(row.budgetPrice).toFixed(2);

      // const quantityString = row.quantity.toString();

      // data.budgetPrice = budgetPriceString;
      // data.quantity = quantityString;

      // const subtotalAmount = format(
      //   chain(bignumber(budgetPriceString)).multiply(bignumber(quantityString)).done()
      // );

      // data.subtotalAmount = Number(subtotalAmount).toFixed(2);
      done();
    },

    handleAddShow(title, row) {
      this.checkForm(this.$refs.crud.addEmptyMaterail, () => {
        // this.$message.warning('添加物料明细前请先填写必填表单!');
      });
    },
    handleBeforeOpenRequestEditor(done, type) {
      done();
    },

    handleCancel() {
      this.$router.back();
    },

    handleCurrentRowChange(currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
    },

    handleOpenFlowDialog() {
      this.openFlowDialog();
    },

    handleSave() {
      this.opreation = OPERATION.SAVE;
      this.checkForm(this.checkMaterialList);
    },

    handleSubmit() {
      this.opreation = OPERATION.SUBMIT;
      this.checkForm(this.checkMaterialList);
    },

    handleTabChange(value) {
      this.tabActive = value.prop;
    },

    addEmptyMaterail() {
      const item = {};

      const showColumnProps = this.getShowColumnProps();

      for (const prop in showColumnProps) {
        item[prop] = '';
      }

      if (showColumnProps.quantity) {
        item.quantity = '0';
      }

      if (showColumnProps.subtotalAmount) {
        item.subtotalAmount = '0';
      }

      this.materialListOption.data.push(item);
    },

    checkMaterialList() {
      const list = this.materialListOption.data;

      if (list.length < 1) {
        this.$message.warning('请添加物料内容!');
        return;
      }

      /*
      let index = 1;

      for (const item of list) {
        if (!Validator.isEmptyString({}, item.materialDesc).isVerified) {
          this.$message.warning(`第${index}行, 请填写 ${this.materialListProps.materialDesc}`);
          return;
        }

        if (!item.budgetPrice) {
          this.$message.warning(`第${index}行, 请填写 ${this.materialListProps.budgetPrice}`);
          return;
        }

        const validateBudgetPriceResult = Validator.isPositiveNumber({}, item.budgetPrice);

        if (!validateBudgetPriceResult.isVerified) {
          this.$message.warning(`第${index}行, ${validateBudgetPriceResult.message}`);
          return;
        }

        if (!item.quantity) {
          this.$message.warning(`第${index}行, 请填写 ${this.materialListProps.quantity}`);
          return;
        }

        const validateQuantityResult = Validator.isPositiveNumber({}, item.quantity);

        if (!validateQuantityResult.isVerified) {
          this.$message.warning(`第${index}行, 请填写 ${this.materialListProps.quantity}`);
          return;
        }

        index = index + 1;
      }
      */

      this.save();
    },

    checkAddedMaterials(list) {
      const data = this.materialListOption.data;

      const addMaterialList = [];
      const existsList = [];

      if (data.length < 1) {
        return {
          addList: list,
          existsList
        };
      } else {
        const materialNumberList = [];

        data.map((item) => {
          item.materialNumber && materialNumberList.push(item.materialNumber);
        });

        for (const item of list) {
          if (item.materialNumber && materialNumberList.includes(item.materialNumber)) {
            existsList.push({
              materialNumber: item.materialNumber,
              name: item.materialDesc || item.materialName || ''
            });
          } else {
            addMaterialList.push(item);
          }
        }
      }

      return {
        addList: addMaterialList,
        existsList
      };
    },

    /*
    checkForm(form, done) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.checkMaterialList();
        } else {
          return false;
        }
      });
    },
    */

    checkForm(callback, failback) {
      this.$refs.head.$refs.form.validate((valid) => {
        if (valid) {
          callback && callback();
        } else {
          failback && failback();
          return false;
        }
      });

      // const headerForm = this.$refs.head.$refs.form;

      // headerForm.error = (err) => {
      //   this.$$message.warning('err', err);
      // };

      // headerForm.submit((form, done) => {
      //   callback && callback();
      //   done();
      // });
    },

    getShowColumnProps() {
      const showColumnProps = this.showColumnProps || {};

      if (!this.showColumnProps) {
        const columns = this.$refs.crud.option.column;

        columns.forEach((item) => {
          showColumnProps[item.prop] = 1;
        });

        this.showColumnProps = showColumnProps;
      }

      return this.showColumnProps;
    },

    hideOpenForms(materialNumber) {},

    openFieldDialog(title = '添加', row = {}) {
      this.fieldDialogForm = title
        ? {
            elsAccount: this.elsAccount,
            whetherDefault: 'Y',
            fromDesc: '',
            fromBusiness: '',
            materials: []
          }
        : {
            ...row,
            materials: []
          };

      this.dialogTitle = `${title}物料明细`;
      this.materialDlgViaible = true;
    },

    openFlowDialog() {
      const event = {
        name: 'openFlowDialog',
        props: {
          flowId: this.flowId
        }
      };

      window.parent.postMessage(event, '*');
    },

    planRowDel(row, index) {
      // 删除
      this.crudPlanData.splice(index, 1);
      this.params.deleteList.push(row);
    },

    planRowSave(row, done, loading) {
      // 保存新增的数据
      if (this.crudPlanData === undefined) {
        this.crudPlanData = [];
      }
      this.crudPlanData.push(row);
      // this.params.addList.push(row);
      done();
    },

    planRowUpdate(row, index, done, loading) {
      loading();
      done();
    },

    resetCrud(columns, tablePermission) {
      this.crudTableConfig.visible = false;

      this.$nextTick(() => {
        this.materialListOption.obj = {};
        this.materialListOption.page = JSON.parse(JSON.stringify(this.crudTableConfig.page));
        this.materialListOption.option.column = columns;

        this.rowPermission = tablePermission;

        this.crudTableConfig.visible = true;
      });
    },

    resetForm(configFormValues, formColumns, data) {
      this.isSetConfigForm = false;

      this.$nextTick(() => {
        this.formObj = configFormValues;

        formColumns.map((item) => {
          item.span = 6;
        });

        this.formOption.column = formColumns;

        this.isSetConfigForm = true;
      });
    },

    releaseBid() {
      const params = {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount
      };

      PurchaseOrderService.release(params)
        .then((res) => {
          if (res.data && res.data.statusCode === '200' && res.data.message === 'response OK') {
            this.$message.success('发布订单成功');
            this.$router.push({ path: ROUTER_PATH_ORDER_V2 });
          } else {
            console.log('release new purchase order fail', res.data);
            this.$message.error('发布价失败, ' + res.data.message || '');
          }
        })
        .catch((err) => {
          console.log('release new purchase order error', err);
          this.$message.error('发布订单失败, ' + err.message || '');
        });
    },

    save() {
      if (this.materialListOption.data.length < 1) {
        this.$message.warning('请添加物料');
        return false;
      }

      // else if (this.supplierData.length < 1) {
      //   this.$message.warning('请添加供应商');
      //   return false;
      // }

      this.saveOrder();
    },

    saveOrder() {
      const params = {};

      Object.assign(params, {
        elsAccount: this.elsAccount,
        elsSubAccount: this.elsSubAccount,
        orderNumber: this.orderNumber
      });

      // get form values from header form
      const formObj = this.$refs.head.getData();

      Object.assign(params, formObj);

      if (!params[this.businessTypeProperty]) {
        this.$message.warning('保存失败, 缺少订单类型');
        return;
      }

      // Object.assign(params, this.formObj);
      // Object.assign(params, this.basicInfoFormObj);

      // if (this.$refs.extendForm) {
      //   Object.assign(params, this.extendForm.form);
      // }

      // handle purchaseVisible, supplierVisible
      /* 78539: 由配置平台取, 不再保存到单据中
      params.purchaseVisible = this.basicInfoFormObj.purchaseVisible.join(',');
      params.supplierVisible = this.basicInfoFormObj.supplierVisible.join(',');
      */

      for (const key in params) {
        if (key.indexOf('$') === 0) {
          delete params[key];
        }
      }

      const itemList = [];

      this.materialListOption.data.forEach((item, index) => {
        item.itemNumber = index + 1;
        itemList.push(item);
      });

      params.orderItemVOList = itemList;
      params.deliveryPlanVOList = this.planListOption.data;

      if (params.startingPrice) {
        params.startingPrice = Number(params.startingPrice);
      }

      if (this.opreation === OPERATION.RELEASE) {
        this.$refs.attachment
          .sendFiles()
          .then((res) => {
            if (!res.result) {
              this.$message.error(res.message || '附件发送失败');
              return;
            }
            this.saveRemote(params);
          })
          .catch((res) => {
            this.$message.error(res.message || '发布失败，请检查附件');
          });
      } else {
        this.saveRemote(params);
      }
    },

    saveRemote(params) {
      const saveMethod = this.opreation === OPERATION.RELEASE ? 'release' : 'update';

      PurchaseOrderService[saveMethod](params)
        .then((res) => {
          if (res.data && res.data.statusCode === '200' && res.data.message === 'response OK') {
            // 保存后的处理
            const data = res.data.data;

            if (this.opreation === OPERATION.SAVE) {
              // 返回列表
              this.$message.success('保存订单成功');
              this.$router.push({ path: ROUTER_PATH_ORDER_V2 });
            } else if (this.opreation === OPERATION.RELEASE) {
              // 返回列表
              this.$message.success('发布订单成功');
              this.$router.push({ path: ROUTER_PATH_ORDER_V2 });
            } else if (this.opreation === OPERATION.SUBMIT) {
              const orderNumber = data.orderNumber;
              this.submitToInspect(orderNumber);
            }
          } else {
            console.log('update new purchase order fail', res.data);
            this.$message.error('保存订单失败, ' + res.data.message || '');
          }
        })
        .catch((err) => {
          console.log('update new purchase order error', err);
          this.$message.error('保存订单失败, ' + err.message || '');
        });
    },

    setTableColumns(configObj) {
      if (!configObj) {
        this.materialListOption.data = [];
        return;
      }

      const configuration = configObj;
      const tableColumns = configuration.tableColumns;

      const columns = [];

      for (const item of tableColumns) {
        // 根据当前登录用户的身份, 检查需要显示的属性
        // if (item[`${userStation}Show`]) {
        const columnItem = {};

        // 删除配置数据中的无效属性
        for (const key in item) {
          if (key.indexOf('$') < 0) {
            columnItem[key] = item[key];
          }
        }

        columns.push(columnItem);
      }

      // 下面的代码：必须满足定制的业务功能，当配置的数据中缺少相应的数据时，通过检查默认的数据来弥补
      /* 订单 目前没有这个设置
      const existColumnProps = {};

      for (const column of columns) {
        existColumnProps[column.prop] = DEFAULT_COLUMN_ITEMS[column.prop] ? 1 : 0;
      }

      for (const columnProp in DEFAULT_COLUMN_ITEMS) {
        if (!existColumnProps[columnProp]) {
          columns.push(DEFAULT_COLUMN_ITEMS[columnProp]);
          existColumnProps[columnProp] = 1;
        }
      }

      this.existColumnProps = existColumnProps;

      const missingProp = {};

      for (let i = 0, len = columns.length; i < len; i++) {
        const colItem = columns[i];
        const prop = colItem.prop;

        if (DEFAULT_COLUMN_ITEMS[prop]) {
          missingProp[prop] = (missingProp[prop] || 0) + 1;
          columns[i] = DEFAULT_COLUMN_ITEMS[prop];
        }
      }

      for (const defaultProp in DEFAULT_COLUMN_ITEMS) {
        if (!missingProp[defaultProp]) {
          columns.push(DEFAULT_COLUMN_ITEMS[defaultProp]);
        }
      }
      */

      const tablePermission = configuration.tablePermission || {};

      // 单子号由应用控制，不允许编辑
      /*
      if (tablePermission.orderNumber) {
        tablePermission.orderNumber.readonly = true;
      }
      */

      // 行号由应用控制，不允许编辑
      /*
      if (tablePermission.itemNumber) {
        tablePermission.itemNumber.readonly = true;
      }
      */

      // 状态由应用控制，不允许编辑
      /*
      if (tablePermission.itemStatus) {
        tablePermission.itemStatus.readonly = true;
      }
      */

      for (const columnProperty in DEFAULT_COLUMN_ITEMS) {
        // 设置 必须满足定制的业务功能 的显示
        if (tablePermission[columnProperty]) {
          tablePermission[columnProperty].display = true;
        } else {
          tablePermission[columnProperty] = {
            display: true
          };
        }
      }

      this.resetCrud(columns, tablePermission);
    },

    submitToInspect(orderNumber) {
      const params = {
        businessType: BUSINESS_TYPE.BEFORE,
        businessId: orderNumber,
        params: '{"key1":"123"}'
      };

      commonApi
        .auditServer('submit', params, 'post')
        .then((res) => {
          if (res.data && res.data.statusCode === '200' && res.data.message === 'response OK') {
            // goto list page
            this.$message.success('提交审批成功');
            this.$router.push({ path: ROUTER_PATH_ORDER_V2 });
          } else {
            console.log('submit request to inspect fail', res.data);
            this.$message.error('提交审批失败, ' + res.data.message || '');
          }
        })
        .catch((err) => {
          console.log('submit request to inspect error', err);
          this.$message.error('提交审批失败, ' + err.message || '');
        });
    }
  }
};
</script>
<style>
.detail-box .el-divider--horizontal {
  margin: 6px 0;
}
.avue-form-box .el-collapse-item__header {
  display: none;
}
.avue-form-box .el-collapse-item__wrap {
  border-bottom: 0px;
}
.avue-form-box .el-collapse-item__content {
  padding-bottom: 0;
}
.avue-form-box .el-collapse {
  border-bottom: 0;
  border-top: 0;
}
</style>
