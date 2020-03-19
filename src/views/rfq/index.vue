<template>
  <div>
    <div>
      <el-button type="primary" size="small" @click="handleCreate">
        新建
      </el-button>
      <el-button
        v-if="['all', 'new', 'quoting', 'quoted', 'priced', 'approval', 'pass'].includes(tabActive)"
        type="primary"
        size="small"
      >
        关闭
      </el-button>
      <el-button v-if="['all', 'new'].includes(tabActive)" type="primary" size="small">
        发布
      </el-button>
      <el-button v-if="['all', 'quoted', 'priced'].includes(tabActive)" type="primary" size="small">
        提交审批
      </el-button>
      <el-button v-if="['all', 'approval', 'pass'].includes(tabActive)" type="primary" size="small">
        审批流程
      </el-button>
      <el-button v-if="['all', 'approval'].includes(tabActive)" type="primary" size="small">
        撤销审批
      </el-button>
    </div>
    <avue-tabs :option="tabOption.option" @change="handleTabChange"></avue-tabs>
    <avue-crud
      :data="tableOption.data"
      :option="tableOption.option"
      :page.sync="tableOption.page"
      v-model="tableOption.obj"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
    </avue-crud>
  </div>
</template>

<script>
import tabOption from '@/const/rfq/navTabs';
import tableOption from '@/const/rfq/index';
import { elsFromSta } from '@/api/rfq';

export default {
  components: {},
  data() {
    return {
      tabOption: tabOption,
      tableOption: tableOption,
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
    handleDelete(row) {
      this.$confirm('确定删除？', '提示').then(() => {
        let params = {
          elsAccount: row.elsAccount,
          whetherDefault: row.whetherDefault,
          fromDesc: row.fromDesc,
          fromBusiness: row.fromBusiness,
          fbk1: this.fbk1
        };
        elsFromSta('delElsFromSta', params).then((res) => {
          if (res.data.statusCode) {
            this.$message.error(res.data.message);
            return;
          }
          this.$message.success('删除成功');
          this.tableData();
        });
      });
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    onSaveForm(form) {
      let params = {
        elsAccount: form.elsAccount,
        whetherDefault: form.whetherDefault,
        fromDesc: form.fromDesc,
        fromBusiness: form.fromBusiness
      };
      let action = 'saveElsFromSta';
      if (this.dialogTitle === '新建类型') {
        action = 'insertElsFromSta';
        params = {
          ...params,
          fbk1: this.fbk1
        };
      }
      elsFromSta(action, params).then((res) => {
        if (res.data.statusCode) {
          this.$message.error(res.data.message);
          return;
        }
        this.$message.success('保存成功');
        this.tableData();
      });
    },
    sizeChange(val) {
      this.tableOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    tableData(data) {
      const params = {
        pageSize: this.tableOption.page.pageSize || 10,
        currentPage: 1,
        ...data,
        tabActive: this.tabActive
      };
      elsFromSta('queryElsFromSta', params).then((res) => {
        if (res.data.statusCode) {
          this.$message.error(res.data.message);
          return;
        }
        this.tableOption.data = res.data.rows;
        this.tableOption.page.total = res.data.total;
      });
    }
  }
};
</script>
