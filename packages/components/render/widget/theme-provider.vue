<template>
  <fast2-block-provider :option="finalOption" :version="version" v-on="$listeners">
    <template v-slot="component">
      <div>
        <slot :option="component.option" :data="myData" :spanMethod="spanMethod"></slot>
      </div>
    </template>
  </fast2-block-provider>
</template>
<script>
import BigListTemplate from '../lib/crud-biglist';
import SmallListTemplate from '../lib/crud-small';
import { mySpanMethod } from '../lib/utils.js';
import _ from 'lodash';

export default {
  name: 'ThemeProvider',
  props: {
    theme: {
      type: String,
      default: 'page' // 分2类 ， 大的列表 为 page, 小的模块内列表为 block, 其他类型待添加
    },
    version: {
      type: String,
      default: '' // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    spanMethodData: {
      type: Object,
      default: function() {
        return {
          row: [2, 3],
          prop: null,
          id: null
        };
      }
    },
    option: {
      type: Object,
      default: function() {
        return {};
      }
    },
    data: {
      type: Array,
      default: function() {
        return [];
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
    },
    myData: function() {
      if (this.spanMethodData.prop) {
        return Object.values(_.groupBy(this.data, this.spanMethodData.prop)).flat();
      }
      return this.data;
    }
  },
  methods: {
    handlerBigThemeOption(option) {
      let newOption = Object.assign(BigListTemplate, option);
      return this.handlerOption(newOption);
    },
    handlerSmallThemeOption(option) {
      let newOption = Object.assign(SmallListTemplate, option);
      return this.handlerOption(newOption);
    },
    handlerOption(option) {
      option.searchMenuSpan = this.getSearchMenuSpan(option.column);
      // 如果无新建按钮 并且不强制显示header ，隐藏headewr
      if (!option.addBtn && !option.header) {
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
    },
    spanMethod({ row, columnIndex }) {
      return mySpanMethod(
        this.myData,
        this.spanMethodData.row,
        this.spanMethodData.prop,
        this.spanMethodData.id,
        columnIndex,
        row
      );
    }
  }
};
</script>
