<template>
  <div class="page-header">
    <el-row>
      <el-col :span="12"
        ><h4>{{ title }}</h4></el-col
      >
      <el-col class="buttons" :span="12">
        <button-group :option="showButtons" v-on="$listeners"></button-group>
      </el-col>
    </el-row>
    <el-divider v-if="!hideLine" class="header-line"></el-divider>
  </div>
</template>
<script>
export default {
  name: 'PageListHeader',
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
        return [];
      }
    }
  },
  computed: {
    showButtons: function() {
      let buttons = [
        ...this.buttons,
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
      return buttons;
    }
  },
  data() {
    return {
      loading: true
    };
  }
};
</script>
<style>
.page-header {
  padding: 0;
  margin: 0;
}
.page-header h4 {
  padding: 0 8px;
  margin-left: 8px;
  border-left: 5px solid #409eff;
}
.page-header .header-line {
  margin: 0 0 8px 0 !important;
  background-color: #b1b6c0;
}
.page-header .buttons .btns-right {
  padding: 0 8px;
  float: right;
}
</style>
