<template>
  <div>
    <slot :list="list"></slot>
  </div>
</template>
<script>
import apis from '@/api/layout';
export default {
  name: 'BlockProvider',
  props: {
    api: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      list: []
    };
  },
  mounted() {
    this.onLoad();
  },
  methods: {
    onLoad(slug = this.api) {
      const url = `block-versions/slug/${slug}`;
      apis.fetchItem(url).then((res) => {
        const json = res.data.outputJson;
        let obj = JSON.parse(json);
        if (typeof obj === 'object') {
          this.list = obj;
        } else {
          this.list = this.unzipLayout(json);
        }
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
