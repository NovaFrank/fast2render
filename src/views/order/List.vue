<template>
  <basic-container>
    <el-button type="primary" size="small" @click="itemAdd">
      新建
    </el-button>
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
        v-if="['All', 'ProviderChanged', 'ProviderApproval'].includes(tabActive)"
        slot-scope="scope"
        slot="status"
      >
        <span>
          {{
            scope.row.orderStatus === ''
              ? '全部'
              : scope.row.orderStatus === '2'
              ? '供方变更'
              : scope.row.orderStatus === '4'
              ? '供方已确认'
              : ''
          }}
        </span>
      </template>
      <template
        v-else-if="['Create', 'Pending', 'Approval', 'Reject'].includes(tabActive)"
        slot-scope="scope"
        slot="status"
      >
        <span>
          {{
            scope.row.auditStatus === '2'
              ? '审批中'
              : scope.row.auditStatus === '0'
              ? '审批通过'
              : scope.row.auditStatus === '3'
              ? '审批驳回'
              : '未提交'
          }}
        </span>
      </template>
      <template
        v-else-if="['ProviderPending'].includes(tabActive)"
        slot-scope="scope"
        slot="status"
      >
        <span>
          {{ scope.row.sendStatus === '1' ? '已发送' : '' }}
        </span>
      </template>
      <!-- orderStatus: "0":"对方未确认","1":"对方已确认","2":"对方已退回","3":"变更对方未确认","4":"变更对方确认","5":"对方变更退回" -->
      <!-- sendStatus: "0":"未发送","1":"已发送", "2":"变更未发送","3":"变更已发送" -->
      <!-- auditStatus: 0, "审批通过", 1, "未审批", 2, "审批中", 3, "审批拒绝" -->
      <template slot-scope="{ row }" slot="orderNumber">
        <!--back 供方退回 需求池过来不可更改任何东西   -->
        <!-- <router-link
          v-if="row.orderStatus === '2' && row.sendStatus === '0'"
          :to="`back/${row.orderNumber}_${row.uuid}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link> -->

        <!--detail 详情 不可修改 只有返回  -->
        <router-link
          v-if="row.orderStatus === '0' && row.sendStatus === '1'"
          :to="`detail/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '3' && row.sendStatus === '3'"
          :to="`detail/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '2' && row.sendStatus === '1'"
          :to="`detail/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '3' && row.sendStatus === '1'"
          :to="`detail/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link v-if="row.auditStatus === '2'" :to="`detail/${row.orderNumber}`">
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '1' && row.sendStatus === '1' && row.auditStatus === '0'"
          :to="`detail/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <!--edit 保存未发送 可编辑修改 -->
        <router-link
          v-if="row.orderStatus === '0' && row.sendStatus === '0' && row.auditStatus === '1'"
          :to="`edit/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '3' && row.sendStatus === '2' && row.auditStatus === '1'"
          :to="`edit/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link v-if="row.auditStatus === '3'" :to="`edit/${row.orderNumber}`">
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>

        <!--view 可修改行数据  -->
        <router-link
          v-if="row.orderStatus === '2' && row.sendStatus === '0'"
          :to="`view/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <!--sendtoprovider-->
        <router-link
          v-if="row.orderStatus === '0' && row.sendStatus === '0' && row.auditStatus === '0'"
          :to="`sendToProvider/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <router-link
          v-if="row.orderStatus === '3' && row.sendStatus === '2' && row.auditStatus === '0'"
          :to="`sendToProvider/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
        <!--send 供方确认 发送货通知单  -->
        <router-link
          v-if="row.orderStatus === '1' && row.orderStatus === '4'"
          :to="`send/${row.orderNumber}`"
        >
          <el-tag>{{ row.orderNumber }}</el-tag>
        </router-link>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import tabOption from '@/const/order/navTabs';
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
        currentPage: this.formOption.page.currentPage,
        pageSize: this.formOption.page.pageSize,
        ...data
      }; // orderStatus: "0":"对方未确认","1":"对方已确认","2":"对方已退回","3":"变更对方未确认","4":"变更对方确认","5":"对方变更退回"
      if (['All', 'ProviderChanged', 'ProviderApproval'].includes(this.tabActive)) {
        params = {
          ...params,
          orderStatus:
            this.tabActive === 'All' ? '' : this.tabActive === 'ProviderChanged' ? '2' : '4'
        };
      } else if (['Create', 'Pending', 'Approval', 'Reject'].includes(this.tabActive)) {
        params = {
          ...params,
          auditStatus:
            this.tabActive === 'Pending'
              ? '2'
              : this.tabActive === 'Approval'
              ? '0'
              : this.tabActive === 'Reject'
              ? '3'
              : '1'
        };
      } else if (['ProviderPending'].includes(this.tabActive)) {
        params = {
          ...params,
          sendStatus: this.tabActive === 'ProviderPending' ? '1' : ''
        };
      }
      const resp = await getOrderList(action, params);
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
