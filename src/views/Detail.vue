<template>
  <basic-container>
    <el-row type="flex" class="row-bg" justify="end">
      <div class="grid-content">
        <button-group :option="btnOption" @item-save="itemSave"></button-group>
      </div>
    </el-row>
    <div class="clear" style="margin-bottom: 30px;"></div>
    <avue-form v-if="formOption.column" :option="formOption" v-model="formObj" ref="form">
      <template slot="applicationType">
        <div>
          <el-select
            v-model="applicationTypeValue"
            @change="selectChange"
            :disabled="selectDisabled"
          >
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
    <h5>物料明细</h5>
    <span>
      <avue-crud
        v-if="crudOption.column"
        :data="crudData"
        :option="crudOption"
        v-model="crudObj"
        :page.sync="page"
        @row-save="rowSave"
        @row-del="rowDel"
        @row-update="rowUpdate"
        ref="crud"
      >
        <!-- <template slot="menuLeft">
          <el-button type="primary" size="small" @click="downloadExcelTemp">下载模板</el-button>
          <el-upload
            style="display: inline-block;"
            :show-file-list="false"
            action="https://cs.51qqt.com/qqt-srm/rest/inquiry/PurchaseRequestService/importExcel"
            :before-upload="beforeUploadExcel"
            :data="{
                elsAccount: '307000',
                fbk20: url,
                fbk30: tableCode
              }"
          >
            <el-button type="primary" size="small">导入 excel</el-button>
          </el-upload>
        </template> -->
      </avue-crud>
    </span>
    <h5>表单文件</h5>
    <span>
      <avue-crud
        :data="uploadData"
        :option="uploadCrudOption"
        v-model="uploadObj"
        :page.sync="page"
        ref="uploadCrud"
      >
        <!-- <template slot="menuLeft">
          <el-button type="primary" size="small">上传</el-button>
          <el-button type="primary" size="small">下载</el-button>
        </template> -->
      </avue-crud>
    </span>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" append-to-body width="80%">
      <avue-crud
        v-if="dialogCrudOption.column"
        :page.sync="page"
        :data="dialogCrudData"
        :option="dialogCrudOption"
        v-model="dialogCrudObj"
        @current-change="currentChange"
        @current-row-change="selectionChange"
        ref="materialCrud"
      >
        <template slot="menuLeft">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="addMaterial"
            >添 加</el-button
          >
        </template>
      </avue-crud>
    </el-dialog>
  </basic-container>
</template>

<script>
import ButtonGroup from '@/common/ButtonGroup';
import {
  getDetailList,
  handleData,
  getApplicationType,
  getTablePageConfig,
  findTableColumnConfig,
  generateExcel,
  uploadServlet,
  queryMaterialList,
  convertExecute,
  findSubAccountByKeyWord,
  findPriceByMaterialNumber
} from '@/api/inquiry.js';
export default {
  components: {
    ButtonGroup
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
      dialogTitle: '',
      inputParamJson: {
        // 业务类型转换传入的值
        itemList: []
      },
      dialogVisible: false,
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
      applicationTypeValue: '', // 申请类型的值
      dicData: [], // 申请类型选项
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
      crudData: [],
      crudOption: {
        dialogDirection: 'rtl',
        dialogType: 'drawer',
        border: true,
        stripe: true,
        index: true,
        indexLabel: '序号',
        page: false,
        align: 'center',
        menuAlign: 'center',
        menuWidth: '180',
        // addBtn: false,
        // editBtn: false,
        // addRowBtn: true,
        // cellBtn: true,
        rowKey: '$index', // todo 需要一个固定的主键，来防止点击行取消时，数据被删
        column: []
      },
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
      // 申请类型的值
      this.applicationTypeValue = this.$route.params && this.$route.params.id.split('_')[1];
      this.purchaseRequestNumber = this.$route.params && this.$route.params.id.split('_')[0];
      if (this.purchaseRequestNumber) {
        this.fechList(this.page, this.purchaseRequestNumber);
      }
    }
    await getApplicationType('307000', {
      tableName: 'purchaseRequisition',
      fieldName: 'requisitionType',
      configColumnCount: '0'
    }).then((res) => {
      // 获取申请类型配置
      this.dicData = res.data.rows;
      if (this.isEdit === false) {
        this.applicationTypeValue = res.data.rows[0].fieldValue;
        this.selectChange(this.applicationTypeValue);
      }
    });
    this.fetchConfig();
    if (this.isEdit === true) {
      // 只有编辑状态下才有默认选项
      this.selectChange(this.applicationTypeValue);
    }
  },
  methods: {
    // 获取采购负责人
    getSubAccount(page) {
      findSubAccountByKeyWord('307000', page).then((res) => {
        this.dialogTitle = '选择采购负责人';
        this.dialogCrudData = res.data.rows;
        this.page.total = res.data.total;
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
      });
    },
    // 获取物料的数据
    getmaterialList(page, keyWord) {
      queryMaterialList('307000', page, keyWord).then((res) => {
        this.dialogTitle = '选择物料';
        this.dialogCrudData = res.data.rows;
        this.page.total = res.data.total;
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
      });
    },
    // 添加物料
    addMaterial() {
      this.dialogVisible = false;
      if (this.dialogTitle === '选择物料') {
        let stringifyData = JSON.stringify(this.inputParamJson);
        convertExecute('307000', '307000', this.typeCode, stringifyData).then((res) => {
          console.log('res :', JSON.parse(res.data.outputParamJson).itemList[0]);
          this.crudObj = Object.assign(
            this.crudObj,
            JSON.parse(res.data.outputParamJson).itemList[0]
          );
        });
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
          this.formObj.requestType = this.applicationTypeValue;
          this.$refs.form.validate((vaild) => {
            if (vaild) {
              this.$message.success(JSON.stringify(this.obj0));
            } else {
              return false;
            }
          });
          console.log('this.formObj :', this.formObj);
          return handleData('307000', this.purchaseRequestNumber, this.params, this.formObj);
        })
        .then(() => {
          this.selectChange(this.applicationTypeValue);
          this.$message.success('保存成功');
        });
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
      generateExcel('307000', this.tableCode).then((res) => {
        this.downloadMessage = res.data.message;
      });
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
      let response = await uploadServlet('307000', file);
      console.log('response :', response);
      /* this.$export.xlsx(file.raw)
        .then(data => {
          this.crudData = data.results.splice(1, 1)
        }) */
    },
    // 选择申请类型的值后触发接口
    async selectChange(value) {
      this.fetchConfig(); // 防止没有配置的选项，form表单显示的是之前的表单配置
      let data = this.dicData.filter((item) => {
        return item.fieldValue === value;
      });
      // this.pageCode = await `purchaseRequisitionConfig_${value}_${data[0].fbk2}_purchase`
      this.tableCode = await `${data[0].elsAccount}_purchaseRequisitionConfig_${value}_${data[0].fbk2}_purchase`;
      this.typeCode = await `${value}_${data[0].fbk2}`; // 接受单据的类型
      this.generateExcelTemp(); // 生成excel模板
      // 动态表头
      getTablePageConfig('307000', this.typeCode).then(async (res) => {
        let rows = await res.data.rows;
        if (rows) {
          let data = rows.map((item) => {
            let newItem = {
              span: 6
            };
            return Object.assign(item, newItem);
          });
          let arr = await this.formColumn.concat(data);
          let price = await findPriceByMaterialNumber('292000', '39001010001', 'avgPrice');
          console.log('price :', price);
          this.formOption.column = arr;
        }
      });
      // 动态表体
      findTableColumnConfig('307000', '1001', '', this.tableCode).then(async (res) => {
        let rows = res.data.rows;
        if (rows) {
          this.tableColumn = rows.map((item) => {
            let newItem = {};
            // ! 添加动态事件。
            if (item.columnCode === 'materialNumber') {
              newItem = {
                click: ({ value, column }) => {
                  this.dialogVisible = true;
                  this.getmaterialList(this.page);
                }
              };
              Object.assign(item, newItem);
            }
            if (item.columnCode === 'purchasePerson') {
              newItem = {
                click: ({ value, column }) => {
                  this.dialogVisible = true;
                  this.getSubAccount(this.page);
                }
              };
              Object.assign(item, newItem);
            }
            if (item.columnCode === 'fbk1') {
              newItem = {
                change: ({ value, column }) => {
                  console.log('value :', value);
                  console.log('column :', column);
                  findPriceByMaterialNumber().then((res) => {
                    console.log('res :', res);
                  });
                }
              };
              Object.assign(item, newItem);
            }
            return item;
          });
        }
        this.crudOption.column = await this.tableColumn;
        this.fechList(this.page, this.purchaseRequestNumber);
      });
    },
    fetchConfig() {
      this.formColumn = [
        {
          label: '采购申请类型',
          prop: 'applicationType',
          span: 6,
          type: 'select',
          formslot: true,
          rules: [
            {
              required: true,
              message: '请选择采购申请类型',
              trigger: 'blur'
            }
          ]
        },
        {
          label: '标题',
          prop: 'subject',
          span: 6,
          prefixIcon: 'el-icon-tickets',
          rules: [
            {
              required: true,
              message: '请输入标题',
              trigger: 'blur'
            }
          ]
        }
      ];
      this.formOption.column = this.formColumn;
    },
    fechList(page, purchaseRequestNumber) {
      getDetailList('307000', purchaseRequestNumber).then((res) => {
        this.crudData = res.data.purchaseRequestItemVOs;
        this.page.total = res.data.total;
        // todo 需要获取sesstion的值来赋值给formObj
        this.formObj = res.data;
      });
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
    }
  }
};
</script>

<style scoped lang="scss">
.avue-crud {
  width: 100%;
}
</style>
