<template>
  <div>
    <el-dialog :title="title" :visible.sync="visable">
      <avue-crud
        ref="crud"
        v-model="crudObj"
        :data.sync="crudData"
        :option.sync="crudOption"
        :page.sync="crudPage"
        :requestMethod="requestMethod"
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
import { deepClone } from '../../../lib/utils';
export default {
  name: 'selectDialogTable',
  props: {
    elsAccount: { type: String, default: '' }, // elsAccount
    elsSubAccount: { type: String, default: '' }, // elsSubAccount
    btnText: { type: String, default: '保存' }, // 保存按钮文字
    title: { type: String, default: '' }, // dialog标题
    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    multiple: { type: Boolean, default: false }, // 是否多选
    actionPath: { type: String, default: null }, // 数据接口地址
    requestMethod: { type: String, default: 'GET' }, // 请求接口METHOD
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
        highlightCurrentRow: true,
        selection: false,
        addBtn: false,
        columnBtn: false,
        refreshBtn: false,
        menu: false,
        index: true,
        indexLabel: '序号',
        border: true,
        column: []
      },
      crudPage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10 // 每页显示多少条
      },
      crudQueryParam: {},
      crudPageParam: {
        currentPage: 1,
        pageSize: 10
      },
      crudMultiple: true
    };
  },
  created() {
    this.crudOption.column = this.column;
    this.crudPage = this.page;
    this.crudMultiple = this.multiple;
    this.crudOption.selection = this.multiple;
    this.crudOption.highlightCurrentRow = !this.multiple;
    this.handleList();
  },
  watch: {
    page: function(newValue) {
      this.crudPage = newValue;
    },
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
      if (this.actionPath === null) {
        this.$message.error('请配置接口地址');
        return;
      }
      let listParams = deepClone(this.crudQueryParam);
      Object.assign(listParams, this.crudPageParam);
      listParams.elsAccount = this.elsAccount;
      this.getCrudData(this.actionPath, listParams);
    },
    getCrudData(url, param) {
      const xhr = new XMLHttpRequest();
      xhr.open(this.requestMethod, url, true);
      xhr.responseType = 'json';
      let dia = this;
      xhr.onload = function() {
        if (xhr.status === 200) {
          let data = JSON.parse(xhr.response);
          if (data.statusCode !== '200') {
            this.$message.error('数据查询失败', data.message);
          } else {
            let pageData = data.pageData;
            dia.crudData = pageData.rows;
            dia.crudPage.total = pageData.total;
            dia.crudPage.currentPage = dia.crudPageParam.currentPage;
            dia.crudPage.pageSize = dia.crudPageParam.pageSize;
          }
        } else {
          console.log('数据查询失败', xhr.status, xhr.statusText);
          this.$message.error('数据查询失败', xhr.statusText);
        }
      };
      xhr.onerror = function() {
        console.log('数据查询失败', xhr.status, xhr.statusText);
        this.$message.error('数据查询失败', xhr.statusText);
      };
      xhr.send(param);
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
      this.crudPageParam.currentPage = 1;
      Object.assign(this.crudQueryParam, params);
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
