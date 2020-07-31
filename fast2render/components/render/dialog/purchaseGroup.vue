<template>
  <div>
    <el-input v-model="seleted" size="small" v-if="!multiple" :readonly="true">
      <el-button slot="append" icon="el-icon-search" @click="visable = true"></el-button>
    </el-input>
    <el-button v-else @click="visable = true">{{ addBtnText }}</el-button>
    <el-dialog :title="title" :visible.sync="visable" append-to-body>
      <avue-crud
        ref="crud"
        v-model="crudObj"
        :data.sync="crudData"
        :option.sync="crudOption"
        :page.sync="crudPage"
        @selection-change="selectionChange"
        @search-change="searchChange"
        @refresh-change="refreshChange"
        @current-change="currentChange"
        @size-change="sizeChange"
        @current-row-change="currentRowChange"
      >
        <template slot="menuLeft">
          <el-button type="primary" size="small" plain @click.stop="crudSave()">{{
            btnText
          }}</el-button>
        </template>
      </avue-crud>
    </el-dialog>
  </div>
</template>
<script>
import { ElsOrgInfoService } from '../../../lib/api/materials';
import DialogOption from './const/purchaseGroupList';
import { getUserInfo } from '../../../lib/auth';
export default {
  name: 'SelectPurchaseGroup',
  props: {
    elsSubAccount: { type: String, default: '' }, // elsSubAccount
    btnText: { type: String, default: '保存' }, // 保存按钮文字
    title: { type: String, default: '' }, // dialog标题
    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    multiple: { type: Boolean, default: false }, // 是否多选
    actionPath: { type: String, default: 'findPageList' }, // 数据接口地址
    seleted: { type: String, default: '' },
    addBtnText: { type: String, default: '选择采购组' },
    // 表格的列配置
    column: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 表格的分页配置
    page: {
      type: Object,
      default: () => {
        return { total: 0, currentPage: 1, pageSize: 10 };
      }
    }
  },
  data() {
    return {
      visable: this.dialogVisible,
      selectColumns: [],
      crudObj: {},
      crudData: [],
      crudOption: {
        indexLabel: '序号',
        indexFixed: false,
        searchShow: false,
        searchBtn: false,
        columnBtn: false,
        align: 'center',
        menu: false,
        border: true,
        highlightCurrentRow: true,
        selection: true,
        stripe: true,
        page: true,
        addBtn: false,
        editBtn: false,
        delBtn: false,
        index: true,
        sortable: true,
        tip: false,
        indeterminate: true,
        column: DialogOption.option.column
      },
      crudPage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10 // 每页显示多少条
      },
      crudPageParam: {
        currentPage: 1,
        pageSize: 10
      },
      crudMultiple: true
    };
  },
  created() {
    this.crudPage = this.page;
    this.crudMultiple = this.multiple;
    this.crudOption.selection = this.multiple;
    this.crudOption.highlightCurrentRow = !this.multiple;
    this.handleList();
  },
  watch: {
    page: function (newValue) {
      this.crudPage = newValue;
    },
    column: function (newValue) {
      this.crudOption.column = newValue;
    },
    visable: function (newValue) {
      this.$emit('update:dialogVisible', newValue);
    },
    dialogVisible: function (newValue) {
      this.visable = newValue;
    }
  },
  methods: {
    handleList() {
      const listParams = {};
      listParams.elsAccount = getUserInfo().elsAccount;
      // listParams.toElsAccout = '307001';
      listParams.orgCategoryId = 'purchaseGroup';
      listParams.currentPage = this.crudPage.currentPage;
      listParams.pageSize = this.crudPage.pageSize;
      ElsOrgInfoService.listPurchaseGroup(this.actionPath, listParams).then((res) => {
        const data = res.data;
        if (data.statusCode !== '200') {
          this.$message.error(data.message);
          return;
        }
        this.crudData = data.pageData.rows;
        this.crudPage.total = data.pageData.total;
        this.crudPage.currentPage = this.crudPageParam.currentPage;
        this.crudPage.pageSize = this.crudPageParam.pageSize;
      });
    },
    crudSave() {
      const selectItems = this.selectColumns;
      this.selectColumns = [];
      this.$refs.crud.selectClear();
      this.$emit('selectDone', selectItems);
      this.visable = false;
    },
    selectionChange(list) {
      if (this.crudMultiple) {
        this.selectColumns = list;
      }
    },
    currentRowChange(row) {
      if (!this.crudMultiple) {
        const list = [];
        list.push(row);
        this.selectColumns = list;
      }
    },
    searchChange(params, done) {
      this.crudPageParam.currentPage = 1;
      // Object.assign(this.crudQueryParam, params);
      this.handleList();
      done();
    },
    refreshChange() {
      this.crudPageParam.currentPage = 1;
      this.handleList();
    },
    currentChange(page) {
      this.crudPageParam.currentPage = page;
      this.handleList();
    },
    sizeChange(pageSize) {
      this.crudPageParam.currentPage = 1;
      this.crudPageParam.pageSize = pageSize;
      this.handleList();
    }
  }
};
</script>
