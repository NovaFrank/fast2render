<template>
  <basic-container>
    <page-header
      title="订单列表"
      :buttons="headerButtons"
      @itemBack="handleCancel"
      @do-action="doBtnAction"
    ></page-header>

    <avue-crud
      ref="crud"
      v-bind="bindVal"
      v-on="onEvent"
      @current-row-change="selectRowChange"
      v-model="form"
      :page.sync="page"
      version="BLOCK_VERSION"
    >
      <template slot="orderNumber" slot-scope="scope">
        <router-link type="primary" :to="`${getItemURL(scope.row)}`" class="link">
          <a-tag color="#1890FF">{{ scope.row.orderNumber }} </a-tag>
        </router-link>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import { BLOCK_VERSION, ROUTER_PATH_ORDER_V2 } from '@/const/index';
import { getUserInfo } from '@/util/utils';

export default window.$crudCommon(
  {
    data() {
      return {
        BLOCK_VERSION: BLOCK_VERSION,
        headerButtons: [
          {
            name: 'btn-createBid',
            label: '新 增',
            icon: 'el-icon-plus',
            size: 'small',
            disabled: false,
            round: false,
            type: 'primary',
            action: 'handleAddItem',
            align: 'btn-right',
            class: ''
          }
        ]
      };
    },
    methods: {
      // 执行参数方法
      doBtnAction(action) {
        this[action]();
      },
      handleAddItem() {
        this.$router.push({ path: `${ROUTER_PATH_ORDER_V2}/create` });
      },
      getDisable(item) {
        if (this.currentRow && item.type === 'rowAction') {
          return 'disabled';
        }
        return '';
      },
      // 列表前操作方法
      listBefore() {
        this.userInfo = getUserInfo();
      },

      // 列表后操作方法
      listAfter() {},

      // 新增前操作方法
      addBefore() {
        this.form.createUser = '307000';
      },
      rowAdd() {
        console.log('添加行');
        this.$refs.crud.rowAdd();
      },
      // 新增后操作方法
      addAfter() {},

      // 修改前操作方法
      updateBefore() {
        this.form.updateUser = '307000';
      },

      // 修改后操作方法
      updateAfter() {},

      // 删除前操作方法
      delBefore() {},

      // 删除后操作方法
      delAfter() {},

      getItemURL(row) {
        let action = 'detail';

        if (
          (row.sourceType === 'request' &&
            row.orderStatus === '0' &&
            row.sendStatus === '0' &&
            row.auditStatus === '1') ||
          (row.orderStatus === '0' &&
            row.sendStatus === '0' &&
            row.auditStatus === '1' &&
            row.sourceType === null)
        ) {
          action = 'edit';
        }

        return `${ROUTER_PATH_ORDER_V2}/${action}/${row.orderNumber}`;
      }
    }
  },
  {
    name: 'order', // 模块名字
    configName: 'purchase/list2', // 配置名字
    serverName: 'PurchaseOrderService', // 后端接口模块名
    list: 'list', // 列表接口名字
    update: 'update', // 更新接口名字
    add: 'add', // 新增接口名字
    del: 'del', // 删除接口名字
    detail: 'detail', // 删除接口名字
    action: 'action', // 删除接口名字
    getAction: 'getAction', // 删除接口名字
    rowKey: 'uuid', // 主键
    pageNumber: 'pageNumber', // 页码
    pageSize: 'pageSize', // 页数
    title: '测试列表页',
    res: (data = {}) => {
      return {
        total: data.total,
        list: data.rows || []
      };
    }, // 列表的结构
    total: 'total', // 总页数
    data: 'list' // 列表属性
  }
);
</script>
<style lang="scss" scoped></style>
