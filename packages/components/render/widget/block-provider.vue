<template>
  <div>
    <slot :list="list"></slot>
  </div>
</template>
<script>
export default {
  name: 'BlockProvider',
  props: {
    api: {
      type: String,
      default: null
    },
    fileType: {
      type: String,
      default: 'block'
    }
  },
  data() {
    return {
      list: [],
      filePath: 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/'
    };
  },
  mounted() {
    let configFilePath = localStorage.getItem('configFilePath');
    if (configFilePath && configFilePath !== '') {
      this.filePath = configFilePath;
    }
    this.onLoad();
  },
  methods: {
    onLoad(slug = this.api) {
      const url = this.filePath + this.fileType + '/' + slug + '.json';
      const request = new XMLHttpRequest();
      request.open('get', url); /*设置请求方法与路径*/
      request.send(null); /*不发送数据到服务器*/
      request.onload = function() {
        /*XHR对象获取到返回信息后执行*/
        if (request.status === 200) {
          /*返回状态为200，即为数据获取成功*/
          const json = JSON.parse(request.responseText);
          this.list = json;
          console.log(json, '获取的json 内容');
        }
      };
      // apis.fetchItem(url).then((res) => {
      //   const json = res.data.outputJson;
      //   let obj = JSON.parse(json);
      //   if (typeof obj === 'object') {
      //     this.list = obj;
      //   } else {
      //     this.list = this.unzipLayout(json);
      //   }
      // });
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
