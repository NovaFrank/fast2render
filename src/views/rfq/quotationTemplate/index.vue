<template>
  <div>
    <avue-crud
      :data="tableOption.data"
      :option="tableOption.option"
      :page.sync="tableOption.page"
      v-model="tableOption.obj"
      :before-open="beforeOpenTemplate"
      @row-save="handleTemplateSave"
      @row-update="handleTemplateUpdate"
      @row-del="handleTemplateDelete"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
      <template slot="columnsForm">
        <avue-crud
          :data="columnsOption.data"
          :option="columnsOption.option"
          :page.sync="columnsOption.page"
          v-model="columnsOption.obj"
          @row-save="handleColumnSave"
          @row-update="handleColumnUpdate"
          @row-del="handleColumnDelete"
          @size-change="sizeChange"
          @current-change="currentChange"
        >
        </avue-crud>
      </template>
    </avue-crud>
  </div>
</template>

<script>
import tableOption from '@/const/rfq/quotationTemplate';
import columnsOption from '@/const/rfq/quotationTemplate/columns';

export default {
  components: {},
  data() {
    return {
      tableOption: tableOption,
      columnsOption: columnsOption,
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
    beforeOpenTemplate(done, type) {
      if (['views', 'edit'].includes(type)) {
        // 查看和编辑逻辑
      } else {
        // 新增逻辑
        // 一定要用setTimeout包裹，由于form组件底层一些机制的设计
        setTimeout(() => {
          this.columnsOption.data = [];
        }, 0);
      }
      done();
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
    handleColumnSave(row, done) {
      this.columnsOption.data.push(row);
      done();
    },
    handleColumnUpdate(row, index, done, loading) {
      this.columnsOption.data.splice(index, 1, row);
      done();
    },
    handleColumnDelete(row, index) {
      this.columnsOption.data.splice(index, 1);
    },
    handleTemplateSave(row, done) {
      this.tableOption.data.push(row);
      done();
    },
    handleTemplateUpdate(row, index, done, loading) {
      this.tableOption.data.splice(index, 1, row);
      done();
    },
    handleTemplateDelete(row, index) {
      this.tableOption.data.splice(index, 1);
    },
    handleTabChange(value) {
      this.tabActive = value.prop;
    },
    onSaveForm(form) {},
    sizeChange(val) {
      this.tableOption.page.pageSize = val;
      this.tableData({
        currentPage: 1,
        pageSize: val
      });
    },
    tableData(data) {}
  }
};
</script>
