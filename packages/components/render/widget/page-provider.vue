<template>
  <div v-if="pageJson">
    <slot></slot>
  </div>
</template>
<script>
import apis from '@/api/layout';

export default {
  name: 'PageProvider',
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
  mounted() {
    this.onLoad();
  },
  methods: {
    onLoad(api = this.api) {
      const url = `block-versions/slug/${api}`;
      apis.fetchItem(url).then((res) => {
        const json = res.data.outputJson;
        const pageJson = this.unzipLayout(json);
        this.pageJson = pageJson;
        this.$emit('updateLayout', { data: this.pageJson, version: this.api });
      });
    },
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
