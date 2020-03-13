<template>
  <div class="form-header">
    <p class="form-title">{{titleText}}</p>
    <div v-if="showButton" class="form-buttons">
      <el-button
        v-for="button in buttons"
        :type="button.type"
        :size="button.size"
        @click="handleClick(button.action)">
        {{button.text}}
      </el-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'form-header',
    components: {
    },
    created: function () {
    },
    props: {
      titleText: String,
      showButton: {
        type: Boolean,
        default: false,
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
              text: '发布',
              type: 'primary',
              size: '',
              action: 'on-release'
            },
            {
              text: '保存',
              type: 'primary',
              size: '',
              action: 'on-save'
            }
          ]
        }
      }
    },
    data() {
      return {
      }
    },
    watch: {
    },
    methods: {
      handleClick(action) {
        this.$emit(action)
      }
    }
  }
</script>


<style scoped>
</style>
