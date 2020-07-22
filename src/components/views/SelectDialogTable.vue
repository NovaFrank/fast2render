<template>
  <div>
    <el-dialog :title="title" :visible.sync="visable">
      <div v-if="subtitle" style="margin-bottom: 10px; margin-top: -15px;" v-text="subtitle"></div>
      <avue-crud
        ref="crud"
        v-model="crudObj"
        :data.sync="crudData"
        :option.sync="crudOption"
        :page.sync="page"
        @selection-change="selectionChange"
        @search-change="searchChange"
        @refresh-change="refreshChange"
        @current-change="currentChange"
        @search-reset="searchReset"
        @size-change="sizeChange"
        @row-click="currentRowChange"
      >
        <template slot="menuLeft">
          <el-button type="primary" size="small" plain @click.stop="doAction()">
            {{ btnText }}
          </el-button>
        </template>
      </avue-crud>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'selectDialogTable',
  props: {
    btnText: { type: String, default: '确定' }, // 保存按钮文字
    title: { type: String, default: '' }, // dialog 标题
    subtitle: { type: String, default: '' }, // dialog 副标题
    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    // 表格的列配置
    column: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 表格的数据
    data: {
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
    },
    // 表格的查询参数（点击搜索时，更新当前参数）
    queryParam: {
      type: Object,
      default: () => {
        return {};
      }
    },
    // 表格的分页参数(点击搜索，切换分页，切换每页展示条数时，更新当前参数)
    pageParam: {
      type: Object,
      default: () => {
        return { pageNo: 1, currentPage: 1, pageSize: 10 };
      }
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visable: this.dialogVisible,
      multipleSelection: [],
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
      crudMultiple: false,
      currentRow: null
    };
  },
  created() {
    this.crudOption.column = this.column;
    this.crudData = this.data;
    this.crudPage = this.page;
    this.crudQueryParam = this.queryParam;
    // this.page = this.pageParam;
    this.crudMultiple = this.multiple;
    this.crudOption.selection = this.multiple;
    this.crudOption.highlightCurrentRow = !this.multiple;

    this.$emit('handleList', this.queryParam, this.page);
  },
  watch: {
    data: function(newValue) {
      this.crudData = newValue;
    },
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
    // // TODO:直接修改对象中的属性不会触发此事件，而父对象传入的参数也会对应改变
    // crudQueryParam: function(newValue) {
    //   this.$emit('update:queryParam', newValue);
    // },
    // // TODO:直接修改对象中的属性不会触发此事件，而父对象传入的参数也会对应改变
    // page: function(newValue) {
    //   this.$emit('update:pageParam', newValue);
    // }
  },
  methods: {
    doAction() {
      const selectItems = this.multipleSelection;

      // if (selectItems.length < 1) {
      //   this.$message.warning('请选择至少一条数据');
      //   return;
      // }

      this.multipleSelection = [];
      this.$refs.crud.selectClear();
      this.$refs.crud.setCurrentRow();
      this.$emit('ok', selectItems);
      this.visable = false;
    },
    selectionChange(list) {
      if (this.crudMultiple) {
        this.multipleSelection = list;
      }
    },
    currentRowChange(row) {
      if (!this.crudMultiple) {
        const list = [];
        list.push(row);
        this.multipleSelection = list;
      }
    },
    searchReset() {
      this.$refs.crud.searchReset();
      this.queryParam = {};
      this.crudQueryParam = {};
      this.page.currentPage = 1;
      Object.assign(this.crudQueryParam, this.queryParam);
      this.$emit('handleList', this.queryParam, this.page);
    },
    searchChange(params, done) {
      this.queryParam = params;
      this.page.currentPage = 1;
      Object.assign(this.crudQueryParam, params);
      this.$emit('handleList', this.queryParam, this.page);
      done();
    },
    refreshChange() {
      this.page.currentPage = 1;
      this.$emit('handleList', this.queryParam, this.page);
    },
    currentChange(page) {
      this.page.currentPage = page;
      this.$emit('handleList', this.queryParam, this.page);
    },
    sizeChange(pageSize) {
      this.page.currentPage = 1;
      this.page.pageSize = pageSize;
      this.$emit('handleList', this.queryParam, this.page);
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.crud.toggleRowSelection(row);
        });
      } else {
        this.$refs.crud.clearSelection();
      }
    }
  }
};
</script>
