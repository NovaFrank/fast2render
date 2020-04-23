<template>
  <div v-if="finaloption">
    <slot :list="list" :option="finaloption"></slot>
  </div>
</template>
<script>
import { getStore, setStore } from '../lib/store';
export default {
  name: 'BlockProvider',
  props: {
    version: {
      type: String,
      default: null
    },
    path: {
      type: String,
      default: null
    },
    fileType: {
      type: String,
      default: 'block'
    },
    option: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      list: [],
      filePath: 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/',
      finaloption: null
    };
  },
  mounted() {
    let configFilePath = localStorage.getItem('configFilePath');
    if (configFilePath && configFilePath !== '') {
      this.filePath = configFilePath;
    }
    if (this.path) {
      this.filePath = this.path;
    }
    if (this.version) {
      this.onLoad(this.version);
    } else {
      this.finaloption = this.option;
    }
  },
  methods: {
    onLoad(slug = this.version) {
      const url = `${this.filePath}${this.fileType}/${slug}.json`;
      let list = getStore({ name: slug, timer: 1200 });
      let _this = this;
      if (list) {
        this.handlerLayoutData(list);
        return;
      }
      const xhr = new XMLHttpRequest();
      xhr.open('get', url, true);

      xhr.responseType = 'json';

      xhr.onload = function() {
        if (xhr.status === 200) {
          _this.handlerLayoutData(xhr.response);
          console.log('获取发布版本OK', url);
          setStore({ name: slug, content: xhr.response });
        } else {
          console.log('获取发布版本失败', xhr.status, xhr.statusText);
          this.$message.error('获取发布版本失败', xhr.statusText);
        }
      };

      xhr.onerror = function() {
        console.log('获取发布版本失败', xhr.status, xhr.statusText);
        this.$message.error('获取发布版本失败', xhr.statusText);
      };

      xhr.send();
    },
    handlerLayoutData(list) {
      this.list = list;
      let finaloption = this.option || { column: [] };
      let option = this.list.find((item) => {
        return item.id === 'listLayout';
      });
      let column = option.data.column;
      if (!column && !column.length) {
        column = finaloption.column;
      }
      column = column.map((item) => {
        return this.fixDicUrl(item);
      });
      this.finaloption = Object.assign(finaloption, column);
    },
    fixDicUrl(config) {
      if (!config || !config.dicUrl) {
        return config;
      }
      // 如果是关联子选择框，去掉自动拉取
      if (config.dicUrl.includes('{{key}}')) {
        config.dicFlag = false;
        return config;
      }
      return config;
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
