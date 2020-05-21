<template>
  <div>
    <h4 class="widget-card__head">规则配置选项</h4>
    <avue-form :option="finalOption" v-bind="$attrs" v-on="$listeners"></avue-form>
  </div>
</template>
<script>
export default {
  name: 'BusinessRuleConfig',
  inheritAttrs: false,
  props: ['list'],
  data() {
    return {
      selectWidget: this.select
    };
  },
  computed: {
    finalOption: function() {
      let option = { column: [], menuBtn: false, labelWidth: '300px' };
      let list = this.list;
      if (list[0] && list[0].data && list[0].data.tableData) {
        list[0].data.tableData.map((item) => {
          let formItem = {
            label: item.settingLable,
            prop: item.settingValue,
            type: item.type,
            defaultValue: item.defaultValue,
            span: 24
          };
          option.column.push(formItem);
        });
      }
      return option;
    }
  }
};
</script>
