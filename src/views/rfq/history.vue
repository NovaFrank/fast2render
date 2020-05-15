<template>
  <div>
    <el-dialog title="报价记录" width="70%" :visible.sync="visable">
      <avue-crud :data.sync="crudData" :option="crudOption.option"> </avue-crud>
    </el-dialog>
  </div>
</template>
<script>
import historyOption from '@/const/rfq/newAndView/history';
export default {
  name: 'history',
  props: {
    title: { type: String, default: '' }, // dialog标题
    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    // 表格的列配置
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
    },
    quoteMethodData: {
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
      crudOption: historyOption,
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
    this.crudData = this.data;
    this.$emit('handleList');
  },
  watch: {
    quoteMethodData: function(newValue) {
      this.crudOption.option.column = this.crudOption.option.column.map((item) => {
        if (item.prop === 'quoteMethod') {
          return {
            ...item,
            dicData: newValue
          };
        }
        return item;
      });
    },
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
      this.initData();
      this.$emit('update:dialogVisible', newValue);
    },
    dialogVisible: function(newValue) {
      this.visable = newValue;
    },
    crudOption: function(newValue) {}
  },
  methods: {
    initData() {}
  }
};
</script>
