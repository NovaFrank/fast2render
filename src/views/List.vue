<template>
  <basic-container>
    <div class="right" ref="rightWrapper">
      <avue-tabs :option="tabOption" @change="handleClick"></avue-tabs>
      <span>
        <avue-crud
          v-if="crudOption.column"
          :data="crudData"
          :option="crudOption"
          v-model="crudObj"
          :page.sync="page"
          @on-load="onLoad"
          @row-del="rowDel"
          @search-change="search"
          @search-reset="searchReset"
          ref="crud"
        >
          <template slot="menuLeft">
            <button-group :option="btnOption" @item-add="itemAdd"></button-group>
          </template>
          <template slot-scope="{ row }" slot="orderNumber">
            <router-link :to="`edit/${row.orderNumber}_${row.requestType}`">
              <el-tag>{{ row.orderNumber }}</el-tag>
            </router-link>
          </template>
        </avue-crud>
      </span>
    </div>
    <div class="clear"></div>
  </basic-container>
</template>

<script>
import ButtonGroup from '@/common/ButtonGroup';
export default {
  components: {
    ButtonGroup
  },
  data() {
    return {
      flag: true,
      type: {},
      page: {
        // pageSizes: [10, 20, 30, 40],默认
        currentPage: 1,
        total: 0,
        pageSize: 20
      },
      activeName: 'first',
      updateObj: {}, // todo 上传的数据
      tabOption: {
        column: [
          {
            label: '新建',
            prop: 'tab1'
          },
          {
            label: '审批中',
            prop: 'tab2'
          },
          {
            label: '审批通过',
            prop: 'tab3'
          },
          {
            label: '审批拒绝',
            prop: 'tab4'
          }
        ]
      },
      crudObj: {},
      crudData: [
        {
          orderNumber: '12003827276',
          elsAccount: '127989832',
          supplierName: '彩虹有限公司',
          createDate: '2020-03-02',
          unix: '2020-03-02',
          orderType: '类型1',
          purchasePerson: '李雷'
        }
      ],
      crudOption: {
        menu: false,
        border: true,
        stripe: true,
        index: true,
        indexLabel: '序号',
        page: false,
        addBtn: false,
        editBtn: false,
        align: 'center',
        menuAlign: 'center',
        menuWidth: '80',
        column: []
      },
      btnOption: [
        {
          name: 'btn-add',
          label: '新建',
          size: 'small',
          type: 'primary',
          action: 'item-add',
          align: 'btn-left'
        },
        {
          name: 'btn-submitAudit',
          label: '提交审批',
          size: 'small',
          type: 'primary',
          action: 'item-submit',
          align: 'btn-left'
        },
        {
          name: 'btn-cancelAudit',
          label: '撤销审批',
          size: 'small',
          type: 'primary',
          action: 'item-cancel',
          align: 'btn-left'
        },
        {
          name: 'btn-process',
          label: '审批流程',
          size: 'small',
          type: 'primary',
          action: 'item-process',
          align: 'btn-left'
        },
        {
          name: 'btn-provider',
          label: '发给供方',
          size: 'small',
          type: 'primary',
          action: 'item-sendprovider',
          align: 'btn-left'
        },
        {
          name: 'btn-recall',
          label: '撤回',
          size: 'small',
          type: 'primary',
          action: 'item-recall',
          align: 'btn-left'
        }
      ]
    };
  },
  created() {
    this.type = this.tabOption.column[0]; // 初始化的tab显示
    this.crudOption.column = [
      // {
      //   label: '单据状态',
      //   prop: 'fbk35',
      //   dicData: DIC.fbk35
      // },
      // {
      //   label: '审批状态',
      //   prop: 'auditStatus',
      //   dicData: DIC.auditStatus
      // },
      {
        label: '订单号',
        prop: 'orderNumber',
        slot: true
      },
      {
        label: 'ELS账号',
        prop: 'elsAccount'
      },
      {
        label: '公司名称',
        prop: 'supplierName'
      },
      {
        label: '创建日期',
        prop: 'createDate'
      },
      {
        label: '时间戳',
        prop: 'unix'
      },
      {
        label: '订单类型',
        prop: 'orderType'
      },
      {
        label: '采购负责人',
        prop: 'purchasePerson'
      }
    ];
  },
  computed: {
    leftStyle: function() {
      return this.flag === true ? 'el-icon-s-fold' : 'el-icon-s-unfold';
    }
  },
  methods: {
    // 切换left关闭打开状态
    toggleLeft() {
      this.flag = !this.flag;
      if (this.flag === false) {
        this.$refs.leftWrapper.style.display = 'none';
        this.$refs.rightWrapper.style.width = 100 + '%';
        this.$refs.toggle.style.left = 10 + 'px';
      } else {
        this.$refs.leftWrapper.style.display = 'block';
        this.$refs.rightWrapper.style.width = 'calc(100% - 220px)';
        this.$refs.toggle.style.left = 220 + 'px';
      }
    },
    // 获取列表数据
    onLoad(page, params = {}) {
      // this.crudData = res.data.rows;
      // this.page.total = res.data.total;
    },
    itemAdd() {
      // 新增
      this.$router.push({ path: '/create' });
    },
    itemSubmit() {
      // 提交审批
      // this.$router.push({ path: '/' })
      console.log('submit');
    },
    itemCancel() {
      // 撤销审批
      // this.$router.push({ path: '/' })
      console.log('cancel');
    },
    itemProcess() {
      // 审批流程
      // this.$router.push({ path: '/' })
      console.log('process');
    },
    itemSendProvider() {
      // 发给供方
    },
    itemRecall() {
      // 撤回
    },
    rowDel(row, index) {
      // 删除
      this.$confirm(`确认修改？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // return delData('307000', row);
        })
        .then(() => {
          this.$message.success('修改成功!');
          this.onLoad(this.page);
        });
    },
    search(params, done) {
      // 搜索
      this.onLoad(this.page, params);
      done();
    },
    searchReset() {
      // 清空搜索
      this.onLoad(this.page);
    },
    auditStatusSearch(value) {
      // 根据审核状态展示数据
      let params = {
        auditStatus: value
      };
      this.onLoad(this.page, params);
    },
    uploadFile(row) {
      // console.log('row :', row)
    },
    async handleClick(tab) {
      this.page = {
        currentPage: 1,
        total: 0,
        pageSize: 20
      };
      this.crudData = [];
      if (tab.prop === 'tab1') {
        this.onLoad(this.page);
      } else if (tab.prop === 'tab2') {
        this.auditStatusSearch(2);
      } else if (tab.prop === 'tab3') {
        this.auditStatusSearch(0);
      } else {
        return false;
      }
      this.type = tab;
      console.log('this.type :', this.type);
    }
  }
};
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin-left: 0;
}
.toggle {
  position: absolute;
  z-index: 4;
  left: 220px;
  top: 20px;
  font-size: 24px;
}
.left {
  width: 220px;
  float: left;
  min-height: 100vh;
  position: relative;
}
.right {
  width: calc(100% - 220px);
  float: left;
}
.btn {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  &:nth-child(1) {
    left: 5px;
    top: 0;
  }
  &:nth-child(2) {
    left: 11px;
    top: 100px;
  }
  &:nth-child(3) {
    left: 90px;
    top: 150px;
  }
  &:nth-child(4) {
    left: 5px;
    top: 200px;
  }
  &:nth-child(5) {
    left: 0;
    top: 300px;
  }
  &:nth-child(6) {
    left: 0;
    top: 400px;
  }
}
.cloumn-line {
  background-color: #dcdfe6;
  width: 1px;
  height: 378px;
  position: absolute;
  z-index: 2;
}
.row-line {
  background-color: #dcdfe6;
  width: 72px;
  height: 1px;
  position: absolute;
  z-index: 2;
}
.line1 {
  left: 45px;
  top: 28px;
}
.line2 {
  left: 59px;
  top: 14px;
}
.line3 {
  height: 300px;
  left: 130px;
  top: 15px;
}
.line9 {
  width: 63px;
  left: 68px;
  top: 315px;
}
.line11 {
  width: 80px;
  left: 120px;
  top: 514px;
}
.avue-crud {
  width: 100%;
}
.diamond_outer {
  width: 80px;
}
.diamond_top {
  width: 0;
  height: 0;
  border-bottom: 20px solid #d9d9d9;
  border-left: 40px solid #ffffff;
  border-right: 40px solid #ffffff;
}
.diamond_bottom {
  width: 0;
  height: 0;
  border-top: 20px solid #d9d9d9;
  border-left: 40px solid #ffffff;
  border-right: 40px solid #ffffff;
}
.diamond_text {
  width: 80px;
  text-align: center;
  margin-top: 12px;
  float: left;
  font-size: 12px;
}
</style>
