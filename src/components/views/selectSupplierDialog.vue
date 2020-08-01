<template>
  <el-dialog :title="title" :visible.sync="visable" width="80%">
    <avue-form class="select-supplier" :option="formOption" v-model="form" ref="form">
      <template slot="suppliers">
        <!-- <el-transfer filterable v-model="form.selectedSupplier" :data="data"></el-transfer> -->
        <kr-paging
          :selectedData="form.selectedSupplier"
          :async="true"
          :filterable="true"
          :pageSize="10"
          :getSearchData="getSearchData"
          :getPageData="getPageData"
          @onChange="onChange"
        ></kr-paging>
      </template>
      <template slot="menuForm">
        <el-button size="small" @click="closeDialog">取消</el-button>
        <el-button size="small" type="primary" @click="handleSubmit()">保存</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>
<script>
import { supplierMasterListAction } from '@/api/rfq/common';
import { getUserInfo } from '@/util/utils.js';
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
      elsAccount: '',
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
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
  },
  watch: {
    crudObj: function (newValue) {
      this.form = newValue;
    },
    visable: function (newValue) {
      this.$emit('update:dialogVisible', newValue);
    },
    dialogVisible: function (newValue) {
      this.visable = newValue;
    }
  },
  methods: {
    closeDialog() {
      this.visable = false;
    },
    async getData(pageIndex = 1, pageSize = 1, keyword = '') {
      const res = await supplierMasterListAction({
        elsAccount: this.elsAccount,
        pageSize: pageSize,
        supplierName: keyword,
        currentPage: pageIndex
      });
      const supplierList = res.data.pageData.rows.map((item, index) => {
        return {
          label: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`,
          key: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`,
          id: `${item.toElsAccount}_${item.supplierName}_${item.firstType || ''}`
        };
      });
      return supplierList;
    },
    async getSearchData(keyword) {
      const data = await this.getData(keyword);
      return data;
    },
    async getPageData(pageIndex, pageSize) {
      const data = await this.getData(pageIndex, pageSize);
      return data;
    },
    handleSubmit() {
      console.log('this.selectColumns', this.selectColumns);
      this.$emit('on-save', this.selectColumns);
      this.visable = false;
    },
    onChange(val) {
      console.log('val', val);
      this.selectColumns = val;
    }
  }
};
</script>

<style scope>
.district-panel {
  width: 350px !important;
  min-width: 150px;
}
.el-transfer-panel .district-panel {
  width: 350px !important;
  min-width: 150px;
}
.el-dialog__body .select-supplier .el-col-sm-12 {
  width: 100%;
}
</style>
