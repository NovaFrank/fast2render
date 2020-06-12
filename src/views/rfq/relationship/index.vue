<template>
  <div class="relationship">
    <div class="content">
      <div class="left-panel">
        <change-list :list="list"></change-list>
      </div>
      <div class="right-panel">
        <report-data :list="reportData"></report-data>
      </div>
    </div>
  </div>
</template>

<script>
import ChangeList from './change-list';
import ReportData from './report-data';
export default {
  name: 'relation',
  components: {
    ChangeList,
    ReportData
  },
  props: {
    list: Array,
    reportData: Object
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.relationship {
  .content {
    height: 100vh;
    display: flex;
    .left-panel {
      width: 300px;
      padding: 30px 20px;
      border-right: 1px solid #e4eef6;
      margin-right: 16px;
    }
    .right-panel {
      width: 100px;
      flex: 1;
    }
  }
}
</style>
