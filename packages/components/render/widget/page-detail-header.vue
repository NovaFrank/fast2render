<template>
  <div class="detail-header">
    <el-row>
      <el-col :span="12"
        ><h4>
          <el-button @click.stop="doAction('itemBack')" circle icon="el-icon-back"> </el-button>
          {{ title }}
        </h4></el-col
      >
      <el-col class="buttons" :span="12">
        <button-group :option="buttons" v-on="$listeners"></button-group>
      </el-col>
    </el-row>
    <el-divider v-if="!hideLine" class="header-line"></el-divider>
  </div>
</template>
<script>
export default {
  name: 'PageDetailHeader',
  props: {
    title: {
      type: String,
      default: null
    },
    hideLine: {
      type: Boolean,
      default: false
    },
    buttons: {
      type: Array,
      default: () => {
        return [
          {
            name: 'btn-add',
            label: '新增',
            icon: 'el-icon-plus',
            size: 'small',
            disabled: false,
            round: false,
            type: 'primary',
            action: 'addItem',
            align: 'btn-right',
            class: ''
          }
        ];
      }
    }
  },
  computed: {},
  data() {
    return {
      loading: true
    };
  },
  methods: {
    doAction(action) {
      this.$emit('do-action', action);
      // this.$message.success(action)
    }
  }
};
</script>
<style scoped>
.detail-header {
  padding: 0;
  margin: 0;
}
.detail-header h4 {
  padding: 0 8px;
  margin-left: 8px;
  border-left: none;
  vertical-align: middle;
  font-size: 1.1em;
}
.detail-header .el-button.is-circle {
  border: 0;
  background-color: transparent;
  color: #409eff;
  padding: 0;
  font-size: 1.6em;
  vertical-align: middle;
}
.detail-header .header-line {
  margin: 0 0 8px 0 !important;
  background-color: #b1b6c0;
}
.detail-header .buttons {
  text-align: right;
}
.detail-header .buttons .btns-right {
  padding: 0 8px;
  float: right;
}
</style>
