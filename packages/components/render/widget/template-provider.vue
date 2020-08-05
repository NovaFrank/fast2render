<template>
  <div v-if="pageJson">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'TemplateProvider',
  props: {
    api: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      pageType: 'page-versions',
      pageJson: []
    };
  },
  created() {},
  mounted() {},
  methods: {
    unzipLayout(jsonObjStr) {
      let _atob = '';
      try {
        _atob = decodeURIComponent(escape(atob(jsonObjStr)));
      } catch (e) {
        _atob = jsonObjStr;
      }
      const projectObj = JSON.parse(_atob);
      console.log(projectObj, '解压缩数据');
      return projectObj;
    }
  }
};
</script>
<style scoped>
.configlist tr {
  cursor: pointer;
}
</style>
