<template>
  <basic-container>
    <page-list-header title="询价管理" @addItem="handleCreate" :hideLine="true"></page-list-header>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <avue-crud
      ref="list"
      :data="tableOption.data"
      :option="tableOption.option"
      :page.sync="tableOption.page"
      v-model="tableOption.obj"
      @current-row-change="handleCurrentRowChange"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot="enquiryNumber" slot-scope="scope">
        <el-button
          @click.stop="handleRowClick(scope.row)"
          class="el-button el-button--text el-button--small"
        >
          {{ scope.row.enquiryNumber }}
        </el-button>
      </template>
      <template slot-scope="scope" slot="materialNumber">
        <el-button
          @click="handleClickMaterial(scope)"
          class="el-button el-button--text el-button--small"
        >
          {{ scope.row.materialNumber }}
        </el-button>
      </template>
      <template
        v-if="['new', 'quoting', 'close'].includes(tabActive)"
        slot-scope="scope"
        slot="status"
      >
        <!-- // new itemStatus 0
            // quoting itemStatus 1
            // close itemStatus 6 -->
        <span>
          {{
            scope.row.itemStatus === '0'
              ? '未发布'
              : scope.row.itemStatus === '1'
              ? '报价中'
              : '已关闭'
          }}
        </span>
      </template>
      <template
        v-else-if="['approval', 'pass', 'reject'].includes(tabActive)"
        slot-scope="scope"
        slot="status"
      >
        <!-- // approval auditStatus 2
            // pass auditStatus 0
            // reject auditStatus 3 -->
        <span>
          {{
            scope.row.auditStatus === '2'
              ? '审批中'
              : scope.row.auditStatus === '0'
              ? '审批通过'
              : '审批驳回'
          }}
        </span>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import tabOption from '@/const/rfq/navTabs';
import tableOption from '@/const/rfq/index';
import { purchaseEnquiryAction } from '@/api/rfq';
import { getUserInfo } from '@/util/utils.js';
import { ElsTemplateConfigService } from '@/api/templateConfig.js';

export default {
  components: {},
  data() {
    return {
      tabOption: tabOption,
      tableOption: tableOption,
      currentSelectRow: {},
      tabActive: 'all',
      buttons: [
        {
          show: true,
          label: '新建'
        }
      ]
    };
  },
  created() {
    const userInfo = getUserInfo();
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
    handleClickMaterial(scope) {
      const router = {
        name: `物料详情(${scope.row.materialNumber})`,
        src: `/masterdata/material/#/view/${scope.row.materialNumber}_${scope.row.factory}`
      };
      const event = {
        name: 'openNewTag',
        props: router
      };
      window.parent.postMessage(event, '*');
    },
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
      this.$router.push({
        path: `/new/${scope.row.enquiryNumber}`
        // query: { enquiryNumber: scope.row.enquiryNumber }
      });
    },
    handleRowClick(row) {
      if (this.tabActive === 'new' || row.itemStatus === '0') {
        this.$router.push({
          path: `/new/${row.enquiryNumber}`
          // query: { enquiryNumber: row.enquiryNumber }
        });
      } else {
        this.$router.push({ path: `/detail/${row.enquiryNumber}` });
      }
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
      // close itemStatus 6
      // approval auditStatus 2
      // pass auditStatus 0
      // reject auditStatus 3
      if (['new', 'quoting', 'close'].includes(this.tabActive)) {
        params = {
          ...params,
          itemStatus: this.tabActive === 'new' ? '0' : this.tabActive === 'quoting' ? '1' : '6'
        };
      } else if (['approval', 'pass', 'reject'].includes(this.tabActive)) {
        params = {
          ...params,
          auditStatus: this.tabActive === 'approval' ? '2' : this.tabActive === 'pass' ? '0' : '3'
        };
      }
      purchaseEnquiryAction('findPageList', params).then((res) => {
        if (res.data.statusCode !== '200') {
          this.$message.error(res.data.message || '请求失败');
          return;
        }
        this.tableOption.data = res.data.pageData.rows;
        this.tableOption.page.total = res.data.pageData.total;
      });

      ElsTemplateConfigService.find({
        elsAccount: '307000',
        businessModule: 'enquiry',
        currentVersionFlag: 'Y'
      }).then((res) => {
        if (res.data && res.data.statusCode === '200' && res.data.pageData) {
          const rows = res.data.pageData.rows || [];
          console.log('rows', rows);
          this.tableOption.option.column = this.tableOption.option.column.map((item) => {
            if (item.prop === 'enquiryType') {
              item.dicData = rows.map((item) => {
                return {
                  value: item.templateNumber,
                  label: item.templateName
                };
              });
            }
            return item;
          });
        }
      });
    }
  }
};
</script>
