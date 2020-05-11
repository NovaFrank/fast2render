<template>
  <basic-container>
    <el-button type="primary" size="small" @click="itemAdd">
      新建
    </el-button>
    <avue-tabs :option="tabOption.option" @change="handleClick"></avue-tabs>
    <!-- <component :is="currentComponent"></component> -->
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
        v-if="
          ['All', 'Create', 'ProviderPending', 'ProviderChanged', 'ProviderApproval'].includes(
            tabActive
          )
        "
        slot-scope="scope"
        slot="status"
      >
        <span>
          {{
            scope.row.orderStatus === ''
              ? '全部'
              : scope.row.orderStatus === '0'
              ? '未提交'
              : scope.row.orderStatus === '1'
              ? '已发送'
              : scope.row.orderStatus === '2'
              ? '供方变更'
              : '供方已确认'
          }}
        </span>
      </template>
      <template
        v-else-if="['Pending', 'Approval', 'Reject'].includes(tabActive)"
        slot-scope="scope"
        slot="status"
      >
        <span>
          {{
            scope.row.auditStatus === '0'
              ? '审批中'
              : scope.row.auditStatus === '1'
              ? '审批通过'
              : '审批驳回'
          }}
        </span>
      </template>
      <template slot-scope="{ row }" slot="orderNumber">
        <router-link
          v-if="
            row.orderStatus === '1' ||
              row.orderStatus === '2' ||
              row.orderStatus === '3' ||
              row.orderStatus === '4'
          "
          :to="`detail/${row.orderNumber}_${row.elsAccount}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '0' && row.sendStatus === '0'"
          :to="`edit/${row.orderNumber}_${row.elsAccount}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '0' && row.sendStatus === '1'"
          :to="`view/${row.orderNumber}_${row.elsAccount}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import tabOption from '@/const/order/navTabs';
// import tableAll from '../tables/tableAll';
// import tableCreate from '../tables/tableCreate';
// import tablePending from '../tables/tablePending';
import formOption from '@/const/order/orderFormOption';
import { getUserInfo } from '@/util/utils.js';
import { getOrderList } from '@/api/order.js';
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
      currentComponent: 'tableAll',
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
      this.currentComponent = 'table' + this.tabActive;
    },
    async tableData(data) {
      const action = 'findPageList';
      let params = {
        elsAccount: this.elsAccount,
        ...data
      };
      if (
        ['All', 'Create', 'ProviderPending', 'ProviderChanged', 'ProviderApproval'].includes(
          this.tabActive
        )
      ) {
        params = {
          ...params,
          orderStatus:
            this.tabActive === 'All'
              ? ''
              : this.tabActive === 'Create'
              ? '0'
              : this.tabActive === 'ProviderPending'
              ? '1'
              : this.tabActive === 'ProviderChanged'
              ? '2'
              : '3'
        };
      } else if (['Pending', 'Approval', 'Reject'].includes(this.tabActive)) {
        params = {
          ...params,
          auditStatus:
            this.tabActive === 'Pending' ? '0' : this.tabActive === 'Approval' ? '1' : '2'
        };
      }
      const resp = await getOrderList(action, params);
      console.log(resp);
      this.formOption.data = resp.data.pageData.rows;
      this.formOption.page.total = resp.data.pageData.total;
    },
    itemAdd() {
      this.$router.push({ path: '/create' });
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
