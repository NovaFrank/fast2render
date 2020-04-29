<template>
  <div class="form-header">
    <p class="form-title">{{ titleText }}</p>
    <div v-if="showButton" class="form-buttons">
      <el-button
        v-for="(button, index) in buttons.filter((item) => item.power)"
        :key="index"
        :type="button.type"
        :size="button.size"
        @click="handleClick(button.action)"
      >
        {{ button.text }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'form-header',
  components: {},
  created: function() {},
  props: {
    titleText: String,
    showButton: {
      type: Boolean,
      default: false
    },
    buttons: {
      type: Array,
      default: () => {
        return [
          {
            power: false,
            text: '取消',
            type: '',
            size: '',
            action: 'on-cancel'
          },
          {
            power: false,
            text: '发布',
            type: 'primary',
            size: '',
            action: 'on-release'
          },
          {
            power: false,
            text: '保存',
            type: 'primary',
            size: '',
            action: 'on-save'
          }
        ];
      }
    }
  },
  data() {
    return {};
  },
  watch: {},
  methods: {
    handleClick(action) {
      this.$emit(action);
    }
  }
};
</script>

<style>
.form-header {
  display: flex;
  height: 80px;
  line-height: 80px;
}
.form-title {
  margin: 0px 20px;
  font-size: 20px;
  font-weight: bold;
}
.form-buttons {
  position: absolute;
  right: 20px;
}
</style>
