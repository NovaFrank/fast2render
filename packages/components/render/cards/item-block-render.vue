<template>
  <div>
    <fast2-component-render
      :list="item.data"
      :mode="mode"
      v-on="$listeners"
      v-bind="$attrs"
    ></fast2-component-render>
  </div>
</template>
<script>
// 属性信息展示卡 - 单条模式
export default {
  name: 'item-block',
  inheritAttrs: false,
  props: {
    item: {
      type: Object,
      default: function() {
        return {
          content: '<p>静态资源占位符号</p>',
          data: '',
          lable: 'lable',
          type: 'list',
          position: 'left',
          slug: '',
          outputJson: {}
        };
      }
    },
    providerData: {
      type: Object,
      default: () => {
        return {
          tableData: []
        };
      }
    },
    mode: {
      type: String,
      default: null
    }
  }
};
</script>

<style lang="scss" scoped>
.label__top {
  span.lable {
    display: block;
  }
  span.showdata {
    display: block;
    margin-left: 10px;
  }
}
.label__left {
  span.lable {
    display: inline-block;
    width: 120px;
  }
  span.showdata {
    display: inline-block;
    margin-left: 10px;
  }
}

span.showdata a {
  text-decoration: underline;
}
</style>
