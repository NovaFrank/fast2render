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
    btnText: { type: String, default: '保存' }, // 保存按钮文字
    title: { type: String, default: '' }, // dialog标题
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
        return { pageNo: 1, pageSize: 10 };
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
      crudPageParam: {},
      crudMultiple: true
    };
  },
  created() {
    this.crudOption.column = this.column;
    this.crudData = this.data;
    this.crudPage = this.page;
    this.crudQueryParam = this.queryParam;
    this.crudPageParam = this.pageParam;
    this.crudMultiple = this.multiple;
    this.crudOption.selection = this.multiple;
    this.crudOption.highlightCurrentRow = !this.multiple;
    this.$emit('handleList');
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
    // crudPageParam: function(newValue) {
    //   this.$emit('update:pageParam', newValue);
    // }
  },
  methods: {
    doAction() {
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
      this.crudPageParam.pageNo = 2;
      Object.assign(this.crudQueryParam, params);
      this.$emit('handleList');
      done();
    },
    refreshChange() {
      this.crudPageParam.pageNo = 1;
      this.$emit('handleList');
    },
    currentChange(page) {
      this.crudPageParam.pageNo = page;
      this.$emit('handleList');
    },
    sizeChange(pageSize) {
      this.crudPageParam.pageNo = 1;
      this.crudPageParam.pageSize = pageSize;
      this.$emit('handleList');
    }
  }
};
</script>
