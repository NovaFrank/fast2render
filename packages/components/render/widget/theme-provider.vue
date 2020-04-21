<template>
  <div>
    <slot :option="finalOption"></slot>
  </div>
</template>
<script>
import BigListTemplate from '../lib/crud-biglist';
import SmallListTemplate from '../lib/crud-small';
export default {
  name: 'ThemeProvider',
  props: {
    theme: {
      type: String,
      default: 'page' // 分2类 ， 大的列表 为 page, 小的模块内列表为 block, 其他类型待添加
    },
    option: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  computed: {
    finalOption: function() {
      let option =
        this.theme === 'page'
          ? this.handlerBigThemeOption(this.option)
          : this.handlerSmallThemeOption(this.option);
      return option;
    }
  },
  methods: {
    handlerBigThemeOption(option, theme) {
      let newOption = {
        ...BigListTemplate,
        ...option
      };
      return this.handlerOption(newOption);
    },
    handlerSmallThemeOption(option, theme) {
      let newOption = {
        ...SmallListTemplate,
        ...option
      };
      return this.handlerOption(newOption);
    },
    handlerOption(option) {
      option.searchMenuSpan = this.getSearchMenuSpan(option.column);
      if (!option.addBtn) {
        option.header = false;
      }
      return option;
    },
    getSearchMenuSpan(column) {
      if (!column) return 24;
      let n = this.getNumberOfSearchAbleField(column);
      if (n % 4) {
        return 6;
      }
      return 24;
    },
    getNumberOfSearchAbleField(column) {
      let n = 0;
      column.map((item) => {
        if (item.search) {
          n++;
        }
      });
      return n;
    }
  }
};
</script>
