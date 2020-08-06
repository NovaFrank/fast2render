<template>
  <div class="page-header">
    <el-row>
      <el-col :span="12"
        ><h4>{{ title }}</h4></el-col
      >
      <el-col class="buttons" :span="12">
        <button-group :option="buttons" v-on="$listeners"></button-group>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: null
    },
    buttons: {
      type: Array,
      default: () => {
        return [];
      }
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
