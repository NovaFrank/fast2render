<template>
  <basic-container>
    <avue-tabs :option="tabOption.option" @change="handleClick"></avue-tabs>
    <component :is="currentComponent"></component>
  </basic-container>
</template>

<script>
import tabOption from '@/const/supplierOrder/navTabs';
import tableAll from '../supplierTables/tableAll';
// import tableUnRelease from './tables/tableUnRelease';
// import tableRelease from './tables/tableRelease';
export default {
  watch: {
    tabActive() {
      // this.tableData();
    }
  },
  components: {
    tableAll
    // tableUnRelease,
    // tableRelease
  },
  data() {
    return {
      tabOption: tabOption,
      currentComponent: 'tableAll',
      tabActive: 'all'
    };
  },
  methods: {
    // 切换表格
    handleClick(tab) {
      this.tabActive = tab.prop;
      this.tab = tab;
      this.currentComponent = 'table' + this.tabActive;
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
