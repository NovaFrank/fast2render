<template>
  <div>
    <span>
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
        <template slot-scope="{ row }" slot="orderNumber">
          <router-link :to="`edit/${row.orderNumber}_${row.elsAccount}`">
            <el-tag>{{ row.orderNumber }}</el-tag>
          </router-link>
        </template>
      </avue-crud>
    </span>
  </div>
</template>
<script>
import formOption from '@/const/supplierOrder/orderFormOption';
import { getUserInfo } from '@/util/utils.js';
import { getOrderList } from '@/api/supplierOrder.js';
// import { getUnfamiliarDataList } from '@/api/supplier/supplier.js';
// import { btnList } from '../data';
export default {
  components: {
    // TODO
  },
  data() {
    return {
      crudObj: {},
      formOption: formOption,
      btnOption: [
        {
          name: 'btn-add',
          label: '新建',
          size: 'small',
          type: 'primary',
          action: 'item-add',
          align: 'btn-left'
        }
      ]
    };
  },
  created() {
    const userInfo = getUserInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;
  },
  methods: {
    async tableData(data) {
      const action = 'findPageList';
      const params = {
        elsAccount: this.elsAccount,
        orderStatus: '',
        ...data
      };
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
<style lang="scss" scoped></style>
