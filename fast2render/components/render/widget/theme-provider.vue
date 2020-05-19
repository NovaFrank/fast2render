<template>
  <div>
    <div v-if="spanMethodData.prop && finalOption">
      <slot :option="finalOption" :data="myData" :spanMethod="spanMethod"></slot>
    </div>
    <div v-else-if="finalOption">
      <slot :option="finalOption" :data="myData"></slot>
    </div>
    <div v-else>
      刷新组件中。。。。。。
    </div>
  </div>
</template>
<script>
import BigListTemplate from '../../../lib/crud-biglist';
import SmallListTemplate from '../../../lib/crud-small';
import BigFormTemplate from '../../../lib/form-big';
import SmallFormTemplate from '../../../lib/form-small';
import { mySpanMethod } from '../../../lib/utils.js';
import { loadBlockConfig, handleColumn } from '../../../lib/blockHander.js';

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
      default: null // 远程获取 表格字段数据配置- 后续扩充 from 类型
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
        return { column: [] };
      }
    },
    data: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      finalOption: null,
      optionHash: ''
    };
  },
  watch: {
    option: {
      handler(n) {
        this.optionHash = JSON.stringify(n);
      },
      immediate: true, // 刷新加载 立马触发一次handler
      deep: true // 可以深度检测到 person 对象的属性值的变化
    },
    // 单点监测 ，避免多次触发
    hash: {
      handler() {
        this.finalOption = null;
        this.handlerChange();
        console.log('参数变化');
      },
      immediate: true // 刷新加载 立马触发一次handler
    }
  },
  computed: {
    hash: function() {
      let { version, theme, type, optionHash } = this;
      let obj = version + theme + type + optionHash;
      return obj;
    },
    myData: function() {
      if (this.spanMethodData.prop) {
        return Object.values(_.groupBy(this.data, this.spanMethodData.prop)).flat();
      }
      return this.data;
    }
  },
  methods: {
    // 参数变化后 执行逻辑
    handlerChange() {
      this.version ? this.mergeRemoteOption() : this.mergeLocalOption();
    },
    // 只有本地配置的处理方法
    mergeLocalOption() {
      let localOption = this.getIntiOption();
      localOption.column = this.handlerColumn(localOption.column);
      this.finalOption = localOption;
      this.$forceUpdate();
    },
    // 使用远程配置的处理方法
    mergeRemoteOption() {
      let localOption = this.getIntiOption();
      let remoteOption = loadBlockConfig(this.version, localOption, this.type);
      if (remoteOption) {
        this.finalOption = remoteOption;

        this.$forceUpdate();
      } else {
        setTimeout(() => {
          this.mergeRemoteOption();
        }, 1000);
      }
    },
    // 先初始化 本地配置和默认配置
    getIntiOption() {
      let localOption;
      if (this.type === 'crud') {
        localOption = this.handlerOption(this.option, this.theme === 'page');
      } else {
        localOption = this.handlerOptionForm(this.option, this.theme === 'page');
      }
      return localOption;
    },
    // 处理行数据
    handlerColumn(column) {
      return handleColumn(column);
    },
    handlerOption(option, isBig) {
      let newOption = JSON.parse(
        JSON.stringify(Object.assign(isBig ? BigListTemplate : SmallListTemplate, option))
      );
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
      let newOption = JSON.parse(
        JSON.stringify(Object.assign(isBig ? BigFormTemplate : SmallFormTemplate, option))
      );
      return newOption;
    },
    loadOption(slug) {
      let option = loadBlockConfig(slug);
      if (option) {
        this.updateOption(option);
      } else {
        setTimeout(() => {
          this.loadOption(slug);
        }, 1000);
      }
    },
    updateOption(option) {
      this.componentOption = option;
      this.$forceUpdate();
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
