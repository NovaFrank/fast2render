<template>
  <div>
    <el-dialog :title="title" :visible.sync="visable" :append-to-body="true">
      <avue-crud
        ref="crud"
        class="listSelect"
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
      crudMultiple: true,
      currentRow: null
    };
  },
  created() {
    this.crudOption.column = this.column;
    this.crudPage = this.page;
    this.crudMultiple = this.multiple;
    this.crudOption.selection = this.multiple;
    this.crudOption.highlightCurrentRow = !this.multiple;
    // this.handleList();
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
      const listParams = deepClone(this.crudQueryParam);
      Object.assign(listParams, this.crudPageParam);
      listParams.elsAccount = this.elsAccount;
      this.getCrudData(this.crudData, listParams);
    },
    getCrudData(param) {
      this.$emit('getData', param);
    },
    crudSave() {
      this.checkSelectedItem();
    },
    ok() {
      const selectItems = this.crudMultiple ? this.selectColumns : [this.currentRow];
      this.selectColumns = [];
      this.currentRow = null;
      this.$refs.crud.selectClear();
      this.$emit('ok', selectItems);
      this.visable = false;
    },
    selectionChange(list) {
      if (this.crudMultiple) {
        this.selectColumns = list;
      }
    },
    checkSelectedItem() {
      const selectedItem = this.crudMultiple ? this.selectColumns.length : this.currentRow;

      if (selectedItem) {
        this.ok();
      } else {
        this.$message('请选择数据!');
      }
    },
    currentRowChange(row) {
      if (!this.crudMultiple) {
        if (row) {
          this.currentRow = row;
        } else if (this.crudData && this.crudData[0]) {
          const defaultRow = this.crudData[0];

          if (this.currentRow) {
            if (
              defaultRow &&
              this.rowKey &&
              this.currentRow[this.rowKey] !== defaultRow[this.rowKey]
            ) {
              this.currentRow = defaultRow;
            }
          } else {
            this.currentRow = defaultRow;
          }
        } else {
          this.currentRow = null;
        }
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
<style>
.listSelect .el-collapse-item__header {
  display: none;
}
.listSelect .el-dialog__body {
  padding-top: 5px;
}
.listSelect .el-collapse {
  border-top: 0;
  border-bottom: 0;
}
</style>
