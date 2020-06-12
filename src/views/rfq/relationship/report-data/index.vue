<template>
  <div class="report-data">
    <!-- <div class="tabs">
      <ul>
        <li
          v-for="(item, index) in tabsList"
          :key="index"
          :class="{ active: item.value === checked }"
          @click="handleChange(item)"
        >
          <div>{{ item.label }}<i :class="item.icon"></i></div>
        </li>
      </ul>
    </div> -->
    <div class="content" v-if="checked === 0">
      <span v-for="(item, index) in list" :key="index">
        <arrow-card :form="item" v-if="!validatenull(item)" class="mb8"></arrow-card>
      </span>
    </div>
    <div class="content" v-if="checked === 1"></div>
  </div>
</template>

<script>
import { validatenull } from '@/util/validate';
import ArrowCard from './arrow-card';
export default {
  components: {
    ArrowCard
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      checked: 0,
      tabsList: [
        { label: '列表模式', icon: '', value: 0 }
        // { label: "图表模式", icon: "", value: 1 }
      ]
    };
  },
  methods: {
    handleChange(item) {
      this.checked = item.value;
    },
    validatenull(value) {
      return validatenull(value);
    }
  }
};
</script>
<style lang="scss" scoped>
.report-data {
  .content {
    padding: 15px;
  }
}
.tabs {
  ul {
    width: 100%;
    border-bottom: 1px solid #e4eef6;
    display: flex;
    li {
      padding: 15px;
      font-size: 14px;
      box-sizing: border-box;
      cursor: pointer;
    }
    li.active {
      position: relative;
      color: #32b8f5;
      &::after {
        content: '';
        position: absolute;
        color: #32b8f5;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 0;
        border-bottom: 1px solid #32b8f5;
      }
    }
  }
}
</style>
