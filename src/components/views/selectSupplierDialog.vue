<template>
  <el-dialog :title="title" :visible.sync="visable">
    <avue-form :option="formOption" v-model="form" ref="form">
      <template slot="suppliers">
        <el-transfer filterable v-model="form.selectedSupplier" :data="data"></el-transfer>
      </template>
      <template slot="menuForm">
        <el-button size="small" @click="closeDialog">取消</el-button>
        <el-button size="small" type="primary" @click="handleSubmit()">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>
<script>
export default {
  name: 'select-supplier-dialog',
  props: {
    title: { type: String, default: '' }, // dialog标题
    dialogVisible: { type: Boolean, default: false }, // dialog显隐
    crudObj: {
      type: Object,
      default: () => {
        return {
          selectedSupplier: []
        };
      }
    },
    // 左侧表格的数据
    data: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      visable: this.dialogVisible,
      form: {},
      selectColumns: [],
      formOption: {
        menuPosition: 'center',
        labelWidth: 0,
        emptyBtn: false,
        submitBtn: false,
        column: [
          {
            formslot: true,
            prop: 'suppliers',
            span: 24
          }
        ]
      }
    };
  },
  created() {
    this.crudPage = this.page;
    this.crudQueryParam = this.queryParam;
    this.crudPageParam = this.pageParam;
    this.crudMultiple = this.multiple;
  },
  watch: {
    crudObj: function(newValue) {
      this.form = newValue;
    },
    visable: function(newValue) {
      this.$emit('update:dialogVisible', newValue);
    },
    dialogVisible: function(newValue) {
      this.visable = newValue;
    }
  },
  methods: {
    closeDialog() {
      this.visable = false;
    },
    handleSubmit() {
      this.$emit('on-save', this.form.selectedSupplier);
      this.visable = false;
    }
  }
};
</script>
