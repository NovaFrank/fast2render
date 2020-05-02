<template>
  <div>
    <fast2-block-provider
      :option="finalOption"
      :version="version"
      :type="type"
      @update-option="updateOption"
    >
    </fast2-block-provider>
    <div v-if="spanMethodData.prop">
      <slot :option="componentOption" :data="myData" :spanMethod="spanMethod"></slot>
    </div>
    <div v-else>
      <slot :option="componentOption" :data="myData"></slot>
    </div>
  </div>
</template>
<script>
import BigListTemplate from '../lib/crud-biglist';
import SmallListTemplate from '../lib/crud-small';
import BigFormTemplate from '../lib/form-big';
import SmallFormTemplate from '../lib/form-small';
import { mySpanMethod } from '../lib/utils.js';
import _ from 'lodash';

export default {
  name: 'ThemeProvider',
  props: {
    theme: {
      type: String,
      default: 'page' // 分2类 ， 大的列表 为 page, 小的模块内列表为 block, 表单为 form  详情为 detail 其他类型待添加
    },
    type: {
      type: String,
      default: 'crud' // 远程获取 表格字段数据配置- 后续扩充 from 类型
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
      if (this.type === 'crud') {
        return this.handlerOption(this.option, this.theme === 'page');
      }
      return this.handlerOptionForm(this.option, this.theme === 'page');
    },
    myData: function() {
      if (this.spanMethodData.prop) {
        return Object.values(_.groupBy(this.data, this.spanMethodData.prop)).flat();
      }
      return this.data;
    }
  },
  methods: {
    handlerOption(option, isBig) {
      let newOption = Object.assign(isBig ? BigListTemplate : SmallListTemplate, option);
      // set option header
      if (!option.addBtn && !option.header) {
        option.header = false;
      }

      // set search menu span
      const column = option.column || [];

      let n = 0;
      column.map((item) => {
        if (item.search) {
          n = n + 1;
        }
      });

      option.searchMenuSpan = n % 4 ? 6 : 24;

      return newOption;
    },
    handlerOptionForm(option, isBig) {
      let newOption = Object.assign(isBig ? BigFormTemplate : SmallFormTemplate, option);
      return newOption;
    },
    updateOption(option) {
      this.componentOption = option;
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
