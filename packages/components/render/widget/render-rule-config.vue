<template>
  <div class="rulebox">
    <h4 class="widget-card__head">规则配置选项</h4>
    <avue-form :option="finalOption" v-bind="$attrs" v-on="$listeners"></avue-form>
  </div>
</template>
<script>
export default {
  name: 'BusinessRuleConfig',
  inheritAttrs: false,
  props: ['list', 'readonly'],
  data() {
    return {
      selectWidget: this.select,
      inited: false
    };
  },
  computed: {
    finalOption: function () {
      const option = { column: [], menuBtn: false, labelWidth: '300px' };
      if (this.readonly) {
        option.detail = true;
        option.menuBtn = false;
      }
      const list = this.list;
      if (list[0] && list[0].data && list[0].data.tableData) {
        list[0].data.tableData.map(async (item) => {
          const formItem = {
            label: item.settingLable,
            prop: item.settingValue,
            type: item.type,
            defaultValue: item.defaultValue,
            span: 12
          };
          if (item.type === 'select' && item.settingValue) {
            let dic = item.settingValue;
            if (item.dicUrl && item.dicUrl.length) {
              dic = item.dicUrl + '';
              delete item.dicUrl;
            }
            if (item.multiple) {
              formItem.multiple = true;
            }
            formItem.dicData = this.$getDicNow(dic);
          }
          option.column.push(formItem);
        });
      }
      return option;
    }
  },
  methods: {}
};
</script>
<style scope>
.rulebox .el-form-item__content {
  display: block;
}
.rulebox .el-form-item--small .el-form-item__content,
.rulebox .el-form-item--small .el-form-item__label {
  display: block;
  float: none;
  text-align: left;
}
</style>
