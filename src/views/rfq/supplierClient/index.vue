<template>
  <basic-container>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <avue-crud
      ref="list"
      :data="tableOption.data"
      :option="tableOption.option"
      :page.sync="tableOption.page"
      v-model="tableOption.obj"
      @row-click="handleRowClick"
      @current-row-change="handleCurrentRowChange"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot-scope="scope" slot="itemStatus">
        <!-- // new itemStatus 0
            // quoting itemStatus 1
            // price itemStatus 4/5
            // close itemStatus 6 -->
        <span>
          {{
            scope.row.itemStatus === '0'
              ? '未发布'
              : scope.row.itemStatus === '1'
              ? '报价中'
              : ['4', '5'].includes(scope.row.itemStatus)
              ? '定价'
              : scope.row.itemStatus === '6'
              ? '已关闭'
              : ''
          }}
        </span>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import tabOption from '@/const/rfq/supplierClient/navTabs';
import tableOption from '@/const/rfq/supplierClient/index';
import { postAction } from '@/api/rfq/supplierClient';
import { getSupplierInfo } from '@/util/utils.js';

export default {
  components: {},
  data() {
    return {
      tabOption: tabOption,
      tableOption: tableOption,
      currentSelectRow: {},
      tabActive: 'all',
      elsAccount: '',
      elsSubAccount: ''
    };
  },
  created() {
    const userInfo = getSupplierInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.tableData();
  },
  watch: {
    tabActive() {
      this.tableData();
    }
  },
  methods: {
    currentChange(val) {
      this.tableOption.page.currentPage = val;
      this.tableData({
        currentPage: val,
        pageSize: this.tableOption.page.pageSize
      });
    },
    handleCreate() {
      this.$router.push({ path: '/new' });
    },
    handleCurrentRowChange(val) {
      this.currentSelectRow = val;
      this.$refs.list.selectClear();
      this.$refs.list.toggleSelection([val]);
    },
    handleDelete(row) {
      this.$confirm('确定删除？', '提示').then(() => {});
    },
    handleEditRow(scope) {
      this.$router.push({ path: '/new', query: { enquiryNumber: scope.row.enquiryNumber } });
    },
    handleRowClick(row, column, event) {
      this.$router.push({ path: `/client/quota/${row.enquiryNumber}` });
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
      this.tableOption.page = {
        currentPage: 1,
        total: 0,
        pageSize: 10
      };
    },
    sizeChange(val) {
      this.tableOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    tableData(data) {
      let params = {
        pageSize: this.tableOption.page.pageSize || 10,
        currentPage: 1,
        ...data,
        elsAccount: this.elsAccount
      };
      // new itemStatus 0
      // quoting itemStatus 1
      // price itemStatus 4/5
      // close itemStatus 6
      if (['new', 'quoting', 'close'].includes(this.tabActive)) {
        params = {
          ...params,
          itemStatus: this.tabActive === 'new' ? '0' : this.tabActive === 'quoting' ? '1' : '6'
        };
      } else if (this.tabActive === 'price') {
        params = {
          ...params,
          itemStatusList: ['4', '5']
        };
      }
      postAction('findPageList', params).then((res) => {
        if (res.data.statusCode !== '200') {
          this.$message.error(res.data.message || '请求失败');
          return;
        }
        this.tableOption.data = res.data.pageData.rows;
        this.tableOption.page.total = res.data.pageData.total;
      });
    }
  }
};
</script>
