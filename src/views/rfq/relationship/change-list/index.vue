<template>
  <div class="change-list">
    <div class="flex-between title">
      <div>
        已选供应商列表
        <!-- <span>{{ total }}</span> -->
      </div>
    </div>
    <div class="box-content mt8">
      <div class="ellipsis company-name" v-for="(item, index) in list" :key="index">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      total: 0
    };
  },
  created() {
    this.total = this.list.length;
  }
};
</script>

<style lang="scss" scoped>
.change-list {
  .title {
    i {
      color: #32b8f5;
      cursor: pointer;
    }
  }
  .box-content {
    border: 1px solid #e4eef6;
    min-height: 400px;
    padding: 8px;
    .company-name {
      font-size: 14px;
      max-width: 260px;
      color: #333333;
      padding: 6px 12px;
      cursor: pointer;
    }
    .company-name:hover {
      color: #32b8f5;
    }
  }
}
</style>
