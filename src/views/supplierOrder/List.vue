<template>
  <basic-container>
    <avue-tabs :option="tabOption.option" @change="handleClick"></avue-tabs>
    <avue-crud
      v-if="formOption.option.column"
      :data="formOption.data"
      :option="formOption.option"
      v-model="crudObj"
      :page.sync="formOption.page"
      @on-load="tableData"
      @size-change="sizeChange"
      @current-change="currentChange"
      ref="crud"
    >
      <template
        v-if="['All', 'UnApproval', 'Approval'].includes(tabActive)"
        slot-scope="scope"
        slot="status"
      >
        <span>
          {{
            scope.row.orderStatus === ''
              ? '全部'
              : scope.row.orderStatus === '0'
              ? '未确认'
              : '已确认'
          }}
        </span>
      </template>
      <template slot-scope="{ row }" slot="orderNumber">
        <router-link
          v-if="row.orderStatus === '0'"
          :to="`orderDetail/${row.orderNumber}_${row.elsAccount}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '1'"
          :to="`orderView/${row.orderNumber}_${row.elsAccount}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import tabOption from '@/const/supplierOrder/navTabs';
import formOption from '@/const/supplierOrder/orderFormOption';
import { getUserInfo } from '@/util/utils.js';
// import { getOrderList } from '@/api/order.js';
import { getOrderList } from '@/api/supplierOrder.js';
export default {
  watch: {
    tabActive() {
      this.tableData();
    }
  },
  components: {
    //
  },
  data() {
    return {
      tabOption: tabOption,
      tabActive: 'all',
      crudObj: {},
      formOption: formOption
    };
  },
  created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
    this.tableData();
  },
  methods: {
    // 切换表格
    handleClick(tab) {
      this.tabActive = tab.prop;
      this.tab = tab;
    },
    async tableData(data) {
      const action = 'findPageList';
      let params = {
        elsAccount: this.elsAccount,
        ...data
      };
      if (
        ['All', 'UnApproval', 'Approval', 'ProviderChanged', 'ProviderApproval'].includes(
          this.tabActive
        )
      ) {
        params = {
          ...params,
          orderStatus: this.tabActive === 'All' ? '' : this.tabActive === 'UnApproval' ? '0' : '1'
        };
      }
      const resp = await getOrderList(action, params);
      console.log(resp);
      this.formOption.data = resp.data.pageData.rows;
      this.formOption.page.total = resp.data.pageData.total;
    },
    // 分页
    currentChange(val) {
      this.formOption.page.currentPage = val;
      this.tableData({
        currentPage: val,
        pageSize: this.formOption.page.pageSize
      });
    },
    sizeChange(val) {
      this.formOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    }
  }
};
</script>

<style>
.latent-btn {
  color: #409eff;
  cursor: pointer;
}
</style>
