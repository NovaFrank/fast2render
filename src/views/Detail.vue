<template>
  <basic-container>
    <form-header
      titleText="新建订单"
      showButton
      :buttons="headerButtons"
      @on-cancel="handleCancel"
      @on-release="handleRelease"
      @on-save="handleSave"
    ></form-header>
    <!-- <button-group :option="btnOption" @item-save="itemSave"></button-group> -->

    <div class="clear" style="margin-bottom: 30px;"></div>
    <avue-form v-if="formOption.column" :option="formOption" v-model="formObj" ref="form">
      <template slot="orderType">
        <div>
          <el-select v-model="orderTypeValue" @change="selectChange">
            <el-option
              v-for="item in dicData"
              :key="item.fieldValue"
              :label="item.fieldValueText"
              :value="item.fieldValue"
            ></el-option>
          </el-select>
        </div>
      </template>
      <template slot="purchaseType">
        <div>
          <el-select v-model="purchaseTypeValue" @change="selectChange">
            <el-option
              v-for="item in dicData"
              :key="item.fieldValue"
              :label="item.fieldValueText"
              :value="item.fieldValue"
            ></el-option>
          </el-select>
        </div>
      </template>
      <template slot="purchaseGroup">
        <div>
          <el-select v-model="purchaseGroupValue" @change="selectChange">
            <el-option
              v-for="item in dicData"
              :key="item.fieldValue"
              :label="item.fieldValueText"
              :value="item.fieldValue"
            ></el-option>
          </el-select>
        </div>
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
        <el-button size="small" @click.stop="handleAddLine('添加', {})">添加行</el-button>
      </template>
    </avue-crud>
    <avue-form
      v-if="tabActive === 'files'"
      :option="fileOption.option"
      v-model="filesForm"
      :upload-before="uploadBefore"
      :upload-after="uploadAfter"
    ></avue-form>
    <avue-form
      v-if="tabActive === 'plan'"
      :option="fileOption.option"
      v-model="filesForm"
      :upload-before="uploadBefore"
      :upload-after="uploadAfter"
    ></avue-form>
    <common-dialog
      :dialogTitle="dialogTitle"
      :dialogOption="dialogOption"
      :common="commonDialogForm"
      :commonDialogVisible="commonDialogVisible"
      :dialogWidth="dialogWidth"
      @on-save-form="onSaveForm"
      @close-common-dialog="closeCommonDialog"
    ></common-dialog>
  </basic-container>
</template>

<script>
import FormHeader from '@/components/formHeader';
import tabOption from '@/const/order/tabs';
import fileOption from '@/const/order/files';
import commonDialog from '@/components/commonDialog';
import addLineOption from '@/const/order/addLine';
import materielListOption from '@/const/order/materielList';
export default {
  components: {
    FormHeader,
    commonDialog
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
      tabOption: tabOption,
      tabActive: 'detail',
      fileOption: fileOption,
      commonDialogForm: {},
      commonDialogVisible: false,
      dialogTitle: '',
      dialogWidth: '50%',
      dialogOption: addLineOption,
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
      orderTypeValue: '', // 订单类型的值
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
      formOption: {
        menuPosition: 'left',
        labelWidth: 120,
        menuBtn: false,
        column: []
      },
      crudObj: {},
      crudData: [
        {
          orderNumber: '12003827276',
          elsAccount: '127989832',
          supplierName: '彩虹有限公司',
          createDate: '2020-03-02',
          unix: '2020-03-02',
          orderType: '类型1',
          purchasePerson: '李雷'
        }
      ],
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
          text: '审批流程',
          type: 'primary',
          size: 'small',
          action: 'on-approval'
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
      dialogCrudObj: {},
      dialogCrudData: [],
      dialogCrudOption: {
        // 系统自带配置的表格
        highlightCurrentRow: true,
        indexLabel: '序号',
        indexFixed: false,
        align: 'center',
        border: true,
        stripe: true,
        page: true,
        menu: false,
        index: true,
        sortable: true,
        tip: false,
        addBtn: false,
        columnBtn: false,
        refreshBtn: false,
        searchBtn: false,
        dialogDrag: true,
        searchMenuSpan: 2,
        column: []
      },
      btnOption: [
        {
          name: 'btn-save',
          label: '保存',
          icon: 'el-icon-plus',
          size: 'small',
          type: 'primary',
          action: 'item-save',
          align: 'btn-left'
        },
        {
          name: 'btn-submitAudit',
          label: '提交审批',
          icon: 'el-icon-plus',
          size: 'small',
          type: 'primary',
          action: 'item-submit',
          align: 'btn-left'
        },
        {
          name: 'btn-cancelAudit',
          label: '撤销审批',
          icon: 'el-icon-plus',
          size: 'small',
          type: 'primary',
          action: 'item-cancel',
          align: 'btn-left'
        },
        {
          name: 'btn-process',
          label: '审批流程',
          icon: 'el-icon-plus',
          size: 'small',
          type: 'primary',
          action: 'item-process',
          align: 'btn-left'
        }
      ]
    };
  },
  async created() {
    // this.formOption.column = this.formColumn // 初始化默认显示的表单
    if (this.isEdit) {
      this.selectDisabled = true;
      // 订单类型的值
      // todo
      if (this.purchaseRequestNumber) {
        this.fechList(this.page, this.purchaseRequestNumber);
      }
    }
    // this.dicData = res.data.rows;
    if (this.isEdit === false) {
      // this.orderTypeValue = res.data.rows[0].fieldValue;
      this.selectChange(this.orderTypeValue);
    }
    this.fetchConfig();
    if (this.isEdit === true) {
      // 只有编辑状态下才有默认选项
      this.selectChange(this.orderTypeValue);
    }
  },
  methods: {
    // 获取采购负责人
    getSubAccount(page) {
      this.dialogTitle = '选择采购负责人';
      // this.dialogCrudData = res.data.rows;
      // this.page.total = res.data.total;
      this.dialogCrudOption.column = [
        {
          label: '过滤条件',
          prop: 'keyWord',
          hide: true,
          search: true,
          searchPlaceholder: '子账号/姓名'
        },
        {
          label: '子账号',
          prop: 'elsSubAccount',
          overHidden: true
        },
        {
          label: '姓名',
          prop: 'name',
          overHidden: true
        }
      ];
    },
    // 获取物料的数据
    getmaterialList(page, keyWord) {
      this.dialogTitle = '选择物料';
      // this.dialogCrudData = res.data.rows;
      // this.page.total = res.data.total;
      this.dialogCrudOption.column = [
        {
          label: '过滤条件',
          prop: 'keyWord',
          hide: true,
          search: true,
          searchPlaceholder: '物料编码/物料名称/物料描述'
        },
        {
          label: '物料分类编码',
          prop: 'fbk1',
          overHidden: true
        },
        {
          label: '物料分类名称',
          prop: 'fbk16',
          overHidden: true
        },
        {
          prop: 'materialNumber',
          width: 120,
          overHidden: true,
          label: '物料编号'
        },
        {
          label: '物料名称',
          prop: 'materialName',
          overHidden: true
        },
        {
          label: '物料描述',
          prop: 'materialDesc',
          overHidden: true
        },
        {
          label: '规格',
          prop: 'fbk2',
          overHidden: true
        },
        {
          label: '型号',
          prop: 'fbk17',
          overHidden: true
        },
        {
          label: '品牌',
          prop: 'materialCategory4',
          overHidden: true
        },
        {
          label: '英文名称',
          prop: 'fbk3',
          overHidden: true
        },
        {
          label: '单位',
          prop: 'basicUnit',
          overHidden: true
        },
        {
          prop: 'extendFactoryCodeList',
          label: '工厂',
          overHidden: true
        },
        {
          prop: 'fbk19',
          label: 'SAP物料组',
          overHidden: true
        },
        {
          prop: 'fbk4',
          label: 'SAP物料号',
          overHidden: true
        },
        {
          prop: 'purchaseGroup',
          label: '采购组',
          overHidden: true
        }
      ];
    },
    // 添加物料
    addMaterial() {
      this.dialogVisible = false;
      if (this.dialogTitle === '选择物料') {
        // todo
      }
      if (this.dialogTitle === '选择采购负责人') {
        this.crudObj.purchasePerson = this.purchaseName;
      }
    },
    // 选择的物料或者采购负责人
    selectionChange(row) {
      if (this.dialogTitle === '选择物料') {
        let arr = [];
        arr.push(row);
        this.inputParamJson.itemList = arr;
      }
      if (this.dialogTitle === '选择采购负责人') {
        this.purchaseName = `${row.elsSubAccount}_${row.name}`;
      }
    },
    // 分页
    currentChange(val) {
      this.page.currentPage = val;
      this.getmaterialList(this.page);
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
    handleTabClick(value) {
      this.tabActive = value.prop;
    },
    // 切换表格
    async handleChange(column) {
      console.log('column :', column);
      this.page = {
        currentPage: 1,
        total: 0,
        pageSize: 10
      };
      this.type = column;
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
    // 选择申请类型的值后触发接口
    async selectChange(value) {
      this.fetchConfig(); // 防止没有配置的选项，form表单显示的是之前的表单配置
    },
    fetchConfig() {
      this.formColumn = [
        {
          label: '订单类型',
          prop: 'orderType',
          span: 6,
          type: 'select',
          formslot: true,
          rules: [
            {
              required: true,
              message: '请选择',
              trigger: 'blur'
            }
          ]
        },
        {
          label: '采购类别',
          prop: 'purchaseType',
          span: 6,
          type: 'select',
          formslot: true,
          rules: [
            {
              required: true,
              message: '请选择',
              trigger: 'blur'
            }
          ]
        },
        {
          label: '采购组',
          prop: 'purchaseGroup',
          span: 6,
          type: 'select',
          formslot: true,
          rules: [
            {
              required: true,
              message: '请选择',
              trigger: 'blur'
            }
          ]
        }
      ];
      this.formOption.column = this.formColumn;
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

    rowUpdate(row, index, done, loading) {
      // 修改数据
      this.$set(this.crudData, index, row);
      this.params.updateList.push(row);
      done();
    },
    rowDel(row, index) {
      // 删除
      this.crudData.splice(index, 1);
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
    handleAddLine(title, row) {
      this.commonDialogForm =
        title === '添加'
          ? {
              elsAccount: 307000,
              whetherDefault: 'Y',
              fromDesc: '',
              fromBusiness: ''
            }
          : row;
      this.dialogTitle = `${title}物料信息`;
      this.commonDialogVisible = true;
    },
    closeCommonDialog() {
      this.commonDialogVisible = false;
    },
    onSaveForm(form) {
      // todo
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
