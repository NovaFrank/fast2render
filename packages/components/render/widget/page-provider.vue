<template>
  <div>
    <slot name="header">
      <page-header :title="title" :buttons="currentButtons" @do-action="doBtnAction"></page-header>
    </slot>
    <slot name="searchBox">
      <fast2-search-provider :option="searchOption"></fast2-search-provider>
    </slot>
    <slot name="tabBox"> </slot>
    <slot name="listBox">
      <fast2-row-page-provider :option="tableOption"></fast2-row-page-provider>
    </slot>
  </div>
</template>
<script>
import { ElsPageConfigService } from '../../../lib/api/materials';
export default {
  name: 'PageProvider',
  props: {
    api: {
      type: Function
    },
    pageCode: {
      type: string,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      title: '页面标题',
      buttons: [],
      searchOption: { column: [], data: {} },
      tableOption: { column: [], data: {} },
      pageType: 'page-versions',
      pageJson: []
    };
  },
  created() {},
  mounted() {},
  methods: {
    loadConfigruations() {
      ElsPageConfigService.list({
        elsAccount: getUserInfo().elsAccount,
        code: this.pageCode
      })
        .then((res) => {
          if (
            res.data &&
            res.data.statusCode === '200' &&
            res.data.message === 'response OK' &&
            res.data.data
          ) {
            const item = res.data.data || {};

            const configJson = item.outputJson || [];

            const json = JSON.parse(configJson);

            const field = json.field;

            const table = json.table;
            const serachColumn = [];
            //TODO 添加权限过滤条件
            field.map((item) => {
              if (item.isSearch) {
                serachColumn.push(item);
              }
            });
            table.map((item) => {
              if (item.isSearch) {
                serachColumn.push(item);
              }
            });

            this.finalOption.column = serachColumn;

            const configurations = {
              listColumns: fiel
            };
            this.configurations = configurations;
          } else {
            console.log('query purchase rquestion cofiguration fail', res.data);
            this.$message.error('查找单据类型数据失败, ' + res.data.message || '');
          }
          // 默认加载
          this.setTableColumns();
        })
        .catch((err) => {
          console.log('query purchase rquestion cofiguration error', err);
          this.$message.error('查找单据类型配置数据失败, ' + err.message || '');
        });
    }
  }
};
</script>
<style scoped>
.configlist tr {
  cursor: pointer;
}
</style>
