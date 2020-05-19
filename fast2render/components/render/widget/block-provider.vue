<template>
  <div>
    <slot :list="list" :field="field" :option="finaloption" v-bind="$attrs"></slot>
  </div>
</template>
<script>
import { getStore } from '../../../lib/store';
import { mergeColumn, vaildData, loadJson, loadDic } from '../../../lib/utils';
import { handleColumn } from '../../../lib/blockHander';
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
      this.finaloption.column = handleColumn(this.finaloption.column);
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
      let column = mergeColumn(finaloption.column, option.data.column);
      this.finaloption = JSON.parse(JSON.stringify(finaloption));
      this.finaloption.column = handleColumn(column);
    }
  }
};
</script>
