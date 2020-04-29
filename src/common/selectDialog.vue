<template>
  <div>
    <el-dialog :title="title" :visible.sync="visable">
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
import { getCrudData } from '@/api/order';
// import { deepClone } from '@/util/utils';
export default {
  name: 'selectDialog',
  props: {
    elsAccount: { type: String, default: '' }, // elsAccount
    elsSubAccount: { type: String, default: '' }, // elsSubAccount
    btnText: { type: String, default: '保存' }, // 保存按钮文字
    title: { type: String, default: '' }, // dialog标题
    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    multiple: { type: Boolean, default: false }, // 是否多选
    actionPath: { type: String, default: null }, // 数据接口地址
    // 表格的列配置
    column: {
      type: Array,
      default: () => {
        return [];
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
        column: []
      },
      crudPage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10 // 每页显示多少条
      },
      crudMultiple: true
    };
  },
  created() {
    this.crudOption.column = this.column;
    this.crudMultiple = this.multiple;
    this.crudOption.selection = this.multiple;
    this.crudOption.highlightCurrentRow = !this.multiple;
    this.handleList();
  },
  watch: {
    column: function(newValue) {
      this.crudOption.column = newValue;
    },
    visable: function(newValue) {
      this.$emit('update:dialogVisible', newValue);
    },
    dialogVisible: function(newValue) {
      this.visable = newValue;
    }
  },
  methods: {
    handleList() {
      let listParams = {};
      listParams.elsAccount = this.elsAccount;
      listParams.currentPage = this.crudPage.currentPage;
      listParams.pageSize = this.crudPage.pageSize;
      getCrudData(this.actionPath, listParams).then((res) => {
        const data = res.data;
        if (data.statusCode !== '200') {
          this.$message.error(data.message);
          return;
        }
        this.crudData = data.pageData.rows;
        this.crudPage.total = data.pageData.total;
      });
    },
    crudSave() {
      let selectItems = this.selectColumns;
      this.selectColumns = [];
      this.$refs.crud.selectClear();
      this.$emit('save', selectItems);
      this.visable = false;
    },
    selectionChange(list) {
      if (this.crudMultiple) {
        this.selectColumns = list;
      }
    },
    currentRowChange(row) {
      if (!this.crudMultiple) {
        let list = [];
        list.push(row);
        this.selectColumns = list;
      }
    },
    searchChange(params, done) {
      this.crudPage.currentPage = 1;
      // Object.assign(this.crudQueryParam, params);
      this.handleList();
      done();
    },
    refreshChange() {
      this.crudPage.currentPage = 1;
      this.handleList();
    },
    // currentChange(page) {
    //   this.crudPageParam.currentPage = page;
    //   this.handleList();
    // },
    // sizeChange(pageSize) {
    //   this.crudPageParam.currentPage = 1;
    //   this.crudPageParam.pageSize = pageSize;
    //   this.handleList();
    // },
    currentChange(val) {
      this.crudPage.currentPage = val;
      this.handleList({
        currentPage: val,
        pageSize: this.crudPage.pageSize
      });
    },
    sizeChange(val) {
      this.crudPage.pageSize = val;
      this.handleList({
        currentPage: 1,
        pageSize: val
      });
    }
  }
};
</script>
