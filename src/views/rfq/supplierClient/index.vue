<template>
  <basic-container>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <fast2-theme-provider theme="block">
      <template>
        <avue-crud
          ref="list"
          :data="tableOption.data"
          :option="tableOption.option"
          :page.sync="tableOption.page"
          v-model="tableOption.obj"
          @size-change="sizeChange"
          @current-change="currentChange"
          :search="search"
          @search-change="searchChange"
          @search-reset="searchReset"
        >
          <template slot="enquiryNumber" slot-scope="scope">
            <el-button
              @click.stop="handleRowClick(scope.row)"
              class="el-button el-button--text el-button--small"
            >
              {{ scope.row.enquiryNumber }}
            </el-button>
          </template>
          <template slot-scope="scope" slot="itemStatus">
            <!-- 
      // new itemStatus 0
      // quoted itemStatus 1
      // price itemStatus 4
      // close itemStatusList 6/5

      // 未报价   itemStatus:1
      // 已报价   itemStatus:2
      // 重报价   itemStatus:3
      // 定价      itemStatus:4
      // 关闭      itemStatusList:[5,6] -->
            <span>
              {{
                scope.row.itemStatus === '1'
                  ? '未报价'
                  : scope.row.itemStatus === '2'
                  ? '已报价'
                  : scope.row.itemStatus === '3'
                  ? '重定价'
                  : scope.row.itemStatus === '4'
                  ? '定价'
                  : ['6', '5'].includes(scope.row.itemStatus)
                  ? '已关闭'
                  : ''
              }}
            </span>
          </template>
        </avue-crud>
      </template>
    </fast2-theme-provider>
  </basic-container>
</template>

<script>
import tabOption from '@/const/rfq/supplierClient/navTabs';
import tableOption from '@/const/rfq/supplierClient/index';
import { postAction } from '@/api/rfq/supplierClient';
import { getSupplierInfo } from '@/util/utils.js';
// import { dataDicAPI } from '@/api/rfq/common';
import { ElsTemplateConfigService } from '@/api/templateConfig.js';

export default {
  components: {},
  data() {
    return {
      tabOption: tabOption,
      tableOption: tableOption,
      tabActive: 'all',
      elsAccount: '',
      search: {},
      elsSubAccount: ''
    };
  },
  created() {
    const userInfo = getSupplierInfo();
    this.elsAccount = userInfo.elsAccount;
    this.elsSubAccount = userInfo.elsSubAccount;

    ElsTemplateConfigService.find({
      elsAccount: '1150000',
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
    this.initDicData();
    this.tableData();
  },
  watch: {
    tabActive() {
      this.search = {};
      this.tableData();
    }
  },
  methods: {
    searchReset() {
      this.$refs.list.searchReset();
      this.tableData();
    },
    searchChange(params, done) {
      this.search = params;
      this.tableOption.page = { pageSize: 10, currentPage: 1 };
      this.tableData(params);
      done();
    },
    currentChange(val) {
      this.tableOption.page.currentPage = val;
      this.tableData({
        currentPage: val,
        pageSize: this.tableOption.page.pageSize,
        ...this.search
      });
    },
    handleCreate() {
      this.$router.push({ path: '/new' });
    },
    handleDelete(row) {
      this.$confirm('确定删除？', '提示').then(() => {});
    },
    handleEditRow(scope) {
      this.$router.push({ path: '/new', query: { enquiryNumber: scope.row.enquiryNumber } });
    },
    handleRowClick(row) {
      this.$router.push({ path: `/client/quota/${row.enquiryNumber}` });
    },
    handleTabChange(value) {
      this.$refs.list.searchReset();
      this.tabActive = value.prop;
      this.tableOption.page = {
        currentPage: 1,
        total: 0,
        pageSize: 10
      };
    },
    initDicData() {
      // 报价方式 数据字典（临时），最好写option dicUrl
      // dataDicAPI('quoteMethod').then((res) => {
      //   this.tableOption.option.column = this.tableOption.option.column.map((item) => {
      //     if (item.prop === 'quoteMethod') {
      //       return {
      //         ...item,
      //         dicData: res.data
      //       };
      //     }
      //     return item;
      //   });
      // });
    },
    sizeChange(val) {
      this.tableOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val,
        ...this.search
      });
    },
    tableData(data) {
      let params = {
        pageSize: this.tableOption.page.pageSize || 10,
        currentPage: 1,
        ...data,
        elsAccount: this.elsAccount
      };

      // 未报价   itemStatus:1
      // 已报价   itemStatus:2
      // 重报价   itemStatus:3
      // 定价      itemStatus:4
      // 关闭      itemStatusList:[5,6]
      if (this.tabActive === 'new') {
        params = {
          ...params,
          itemStatus: '1'
        };
      } else if (this.tabActive === 'quoted') {
        params = {
          ...params,
          itemStatus: '2'
        };
      } else if (this.tabActive === 'requote') {
        params = {
          ...params,
          itemStatus: '3'
        };
      } else if (this.tabActive === 'price') {
        params = {
          ...params,
          itemStatus: '4'
        };
      } else if (this.tabActive === 'close') {
        params = {
          ...params,
          itemStatusList: ['5', '6']
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
