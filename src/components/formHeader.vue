<template>
  <div class="form-header">
    <p class="form-title">{{ titleText }}</p>
    <div v-if="showButton" class="form-buttons">
      <el-button
        v-for="button in buttons"
        :key="button.text"
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
            text: '取消',
            type: '',
            size: '',
            action: 'on-cancel'
          },
          {
            text: '撤销审批',
            type: 'primary',
            size: '',
            action: 'recall'
          },
          {
            text: '保存',
            type: 'primary',
            size: '',
            action: 'on-save'
          },
          {
            text: '审批流程',
            type: 'primary',
            size: '',
            action: 'on-approval'
          },
          {
            text: '提交审批',
            type: 'primary',
            size: '',
            action: 'on-submit'
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

<style scoped lang="scss">
.avue-crud {
  width: 100%;
}
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
