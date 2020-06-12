<template>
  <el-dialog :title="title" :visible.sync="visable" width="100%" top="0">
    <relation :list="leftData" :reportData="rightData"></relation>
  </el-dialog>
</template>
<script>
import relation from './index';
export default {
  name: 'relation-dialog',
  components: { relation },
  props: {
    leftData: Array,
    rightData: Object,
    dialogVisible: { type: Boolean, default: false } // dialog显隐
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
    }
  }
};
</script>
