<template>
  <div>
    <div v-if="spanMethodData.prop">
      <slot :option="finalOption" :data="myData" :spanMethod="spanMethod" :reload="reload"></slot>
    </div>
    <div v-else>
      <slot :option="finalOption" :data="myData" :reload="reload"></slot>
    </div>
  </div>
</template>
<script>
import BigListTemplate from '../../../lib/crud-biglist';
import SmallListTemplate from '../../../lib/crud-small';
import BigFormTemplate from '../../../lib/form-big';
import SmallFormTemplate from '../../../lib/form-small';
import { mySpanMethod, zipLayout, getApiPath } from '../../../lib/utils.js';
import { loadBlockConfig, handleColumn } from '../../../lib/blockHander.js';
import { validateNull } from '../../../lib/validate';

import _ from 'lodash';
const baseUrl = getApiPath();

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
    readOnly: {
      type: Boolean,
      default: false // 是否只读模式
    },
    hasRowPermission: {
      type: Boolean,
      default: false // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    addInCell: {
      type: Boolean,
      default: false // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    col:{
      type: Number,
      default: 0
    },
    inTab: {
      type: Boolean,
      default: false // 远程获取 表格字段数据配置- 后续扩充 from 类型
    },
    rowPermission: {
      type: Object,
      default: function() {
        return {};
      }
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
      finalOption: {},
      reload: false,
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
        if (!this.finalOption) {
          this.handlerChange();
        } else {
          this.reload = true;
        }
      },
      immediate: true // 刷新加载 立马触发一次handler
    }
  },
  computed: {
    hash: function() {
      const { version, theme, type, optionHash, rowPermission } = this;
      const fullText = zipLayout(
        JSON.stringify({ version, theme, type, optionHash, rowPermission })
      );
      const str = fullText.substring(fullText.length - 32);
      const obj = (version || 'local') + '-' + str;
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
    setFinalOption(option) {
      if (this.readOnly) {
        option.detail = true;
        option.menu = false;
      }
      if (this.hasRowPermission) {
        this.finalOption = this.filterColumWithRule(option, this.rowPermission);
      } else {
        this.finalOption = option;
      }
      if (this.inTab && this.type !== 'crud') {
        this.finalOption.menuBtn = false;
        this.finalOption.menu = false;
      }
       if (this.addInCell && this.type === 'crud') {
         this.finalOption.editBtn = false;
         this.finalOption.cellBtn = true;
         this.finalOption.saveBtn = true;
      }
      if (this.readOnly) {
         this.finalOption.detail = true;
         this.finalOption.menu = false;
      }
      if (this.col > 0) {
        this.finalOption.column.map((item) => {
          item.span = this.col;
        });
      }
      this.reload = true;
    },
    filterColumWithRule(option, rowPermission) {
      const newColumn = [];
      option.column.map((item) => {
        const itemProp = rowPermission[item.prop];
        if (itemProp) {
          if (itemProp.display && itemProp.display !== false) {
            let label = item.label;
            if (itemProp.displayName) {
              item.label = itemProp.displayName;
              label = itemProp.displayName;
            }
            const isRequired = !!itemProp.isRequired;
            if (isRequired) {
              const rule = {
                required: true,
                message: '请输入' + label,
                trigger: 'blur'
              };
              if (item.rules) {
                item.rules.push(rule);
              } else {
                item.rules = [rule];
              }
            }
            if (!validateNull(itemProp.bizDic)) {
              delete item.dicData;
              delete item.dicMethod;
              delete item.props;
              item.type = 'select';
              item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${itemProp.bizDic}`;
            }
            if (itemProp.isDisabled || itemProp.readonly) {
              item.disabled = 'disabled';
              item.cell = false;
              item.rules = [];
            } else {
              item.cell = true;
            }
            item.display = true;
            newColumn.push(item);
          }
        } else {
          const isLocalDefine = this.option.column.find((subitem) => {
            return subitem.prop === item.prop;
          });

          if (!validateNull(isLocalDefine)) {
            newColumn.push(item);
          }
        }
      });
      option.column = newColumn;
      return option;
    },
    // 只有本地配置的处理方法
    mergeLocalOption() {
      const localOption = this.getInitOption();
      localOption.column = this.handlerColumn(localOption.column);
      this.setFinalOption(localOption);
      this.$forceUpdate();
    },
    // 使用远程配置的处理方法
    async mergeRemoteOption() {
      const localOption = this.getInitOption();
      const remoteOption = await loadBlockConfig(this.version, localOption, this.type);
      if (remoteOption) {
        this.setFinalOption(remoteOption);
        this.$forceUpdate();
      } else {
        setTimeout(() => {
          this.mergeRemoteOption();
        }, 1000);
      }
    },
    // 先初始化 本地配置和默认配置
    getInitOption() {
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
      const bigTemp = JSON.parse(JSON.stringify(BigListTemplate));
      const smallTemp = JSON.parse(JSON.stringify(SmallListTemplate));
      const newOption = Object.assign(isBig ? bigTemp : smallTemp, option);
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
      const bigTemp = JSON.parse(JSON.stringify(BigFormTemplate));
      const smallTemp = JSON.parse(JSON.stringify(SmallFormTemplate));
      const newOption = Object.assign(isBig ? bigTemp : smallTemp, option);
      return newOption;
    },
    async loadOption(slug) {
      const option = await loadBlockConfig(slug);
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
