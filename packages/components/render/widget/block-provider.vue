<template>
  <div>
    <slot :list="list" :field="field" :option="finaloption" v-bind="$attrs"></slot>
  </div>
</template>
<script>
import { getStore } from '../../../lib/store';
import { mergeColumn, vaildData, loadJson, loadDic } from '../../../lib/utils';
export default {
  name: 'BlockProvider',
  inheritAttrs: false,
  props: {
    version: {
      type: String,
      default: null
    },
    type: {
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
      field: [],
      filePath: 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/',
      finaloption: null
    };
  },
  watch: {
    finaloption(val) {
      if (val) {
        this.$emit('update-option', val);
      }
    }
  },
  created() {
    this.checkDic();
    console.log('load dic file');
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
      this.finaloption = vaildData(this.option, { column: [] });
      this.finaloption.column = this.handleColumn(this.finaloption.column);
    }
  },
  methods: {
    onLoad(slug = this.version) {
      const url = `${this.filePath}${this.fileType}/${slug}.json`;
      let list = getStore({ name: slug, timer: 1200 });
      if (list) {
        this.handlerLayoutData(list);
      } else {
        loadJson(url, slug);
        setTimeout(this.onLoad, 1000);
      }
    },
    checkDic() {
      let dic = getStore({ name: 'commondic', timer: 1200 });
      if (dic) {
        this.dics = dic;
      } else {
        loadDic();
      }
    },
    handlerLayoutData(list) {
      if (!list) {
        return;
      }
      this.list = list;
      let finaloption = vaildData(this.option, { column: [] });
      let findStr = {
        crud: 'listLayout',
        form: 'detailLayout',
        detail: 'detailLayout'
      };
      let options = list.filter((item) => {
        return item.id === findStr[this.type];
      });
      let option = options[0] || {};
      option = vaildData(option, { data: { column: [] } });
      let column = mergeColumn(option.data.column, finaloption.column);
      this.finaloption = JSON.parse(JSON.stringify(finaloption));
      this.finaloption.column = this.handleColumn(column);
    },
    handleColumn(column) {
      let newcolumn = column.map((item) => {
        return this.fixColumn(item);
      });
      return newcolumn;
    },
    replaceLocalDic(config) {
      if (!config.dicUrl.includes('layout/dics')) {
        return config;
      }
      let slug = config.dicUrl.split('layout/dics/value/')[1];
      if (slug && this.dics && this.dics[slug]) {
        delete config.dicUrl;
        config.dicData = this.dics[slug];
        console.log('使用本地词典', config.dicData);
      }
      return config;
    },
    fixColumn(config) {
      if (!config || !config.dicUrl) {
        return config;
      }
      // 如果是关联子选择框，去掉自动拉取
      if (config.dicUrl.includes('{{key}}')) {
        config.dicFlag = false;
        return config;
      }
      config = this.replaceLocalDic(config);
      if (config.span) {
        config.span = config.span * 1;
      }
      return config;
    }
  }
};
</script>
