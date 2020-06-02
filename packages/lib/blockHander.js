import { getStore } from '../lib/store';
import { vaildData, loadJson, loadDic, getObjType, sortArrys } from '../lib/utils';
import _ from 'lodash';

let filePath = 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/';
const fileType = 'block';

let customFilePath = getStore({ name: 'customFilePath' });
if (customFilePath) {
  filePath = customFilePath;
}

export const loadBlockConfig = (slug, option, type) => {
  const url = `${filePath}${fileType}/${slug}.json`;
  let list = getStore({ name: slug, timer: 1200 });
  if (list) {
    return mergeOption(list, option, type);
  } else {
    loadJson(url, slug);
    return false;
  }
};

export const checkDic = () => {
  let dic = getStore({ name: 'commondic', timer: 1200 });
  if (!dic) {
    loadDic();
  } else {
    return dic;
  }
};
export const mergeOption = (list, option, type) => {
  if (getObjType(list) !== 'array') {
    return;
  }
  let finalOption = vaildData(option, { column: [] });
  let findStr = {
    crud: 'listLayout',
    form: 'detailLayout',
    detail: 'detailLayout'
  };
  let options = list.filter((item) => {
    return item.id === findStr[type];
  });
  let newOption = options[0] || {};
  option = vaildData(newOption, { data: { column: [] } });
  let column = mergeColumn(option.data.column, finalOption.column);
  finalOption = JSON.parse(JSON.stringify(finalOption));
  finalOption.column = handleColumn(column);
  return finalOption;
};

export const handleColumn = (column) => {
  let newColumn = column.map((item) => {
    return fixColumn(item);
  });
  newColumn = sortArrys(newColumn, 'order');
  return newColumn;
};

/**
 *
 * @param {*} remoteColumn 远程配置系统配置的column 属性
 * @param {*} localColum  本地附件修正的column 属性
 */
export const mergeColumn = (remoteColumn = [], localColum = []) => {
  // 以远程配置为基准
  let newColumn = remoteColumn;
  // 如果远程配置未定义，则直接添加到数组
  localColum.map((item) => {
    newColumn = newColumn.map((subitem) => {
      let newSubItem = subitem;
      if (subitem.prop === item.prop) {
        newSubItem = _.merge(subitem, item);
      }
      return newSubItem;
    });
    let isExist = newColumn.find((subitem) => {
      return subitem.prop === item.prop;
    });
    console.log('是否有重复项', isExist);
    if (!isExist) {
      newColumn.push(item);
    }
  });
  return newColumn;
};

export const replaceLocalDic = (config) => {
  let dics = checkDic();
  if (!(config.dicUrl.includes('layout/dics') || config.datatype === 'remoteDic')) {
    return config;
  }
  let slug = config.dicUrl.includes('layout/dics')
    ? config.dicUrl.split('layout/dics/value/')[1]
    : config.dicUrl;
  if (slug && dics && dics[slug]) {
    delete config.dicUrl;
    config.dicData = dics[slug];
    console.log('使用本地词典', config.dicData);
  }
  return config;
};
export const fixRemoteDic = (config) => {
  config.type = 'select';
  let path = config.res ? config.res : 'list';
  config.dicFormatter = (res) => {
    return res.data[path];
  };
  config.props = {
    label: config.dicLabel,
    value: config.dicValue
  };
  if (config.dicQueryStr && config.dicMethod === 'post') {
    try {
      let query = JSON.parse(config.dicQueryStr);
      config.dicQuery = query;
    } catch (err) {
      delete config.dicQuery;
    }
  }
  return config;
};

export const fixColumn = (config) => {
  let type = getObjType(config.order);
  if (type !== 'number') {
    config.order = 1;
  }
  if (!config || !config.dicUrl) {
    return config;
  }
  // 如果是关联子选择框，去掉自动拉取
  if (config.dicUrl.includes('{{key}}')) {
    config.dicFlag = false;
    return config;
  }
  config.type = 'select';
  config = replaceLocalDic(config);
  if (config.datatype === 'apiDic') {
    config = fixRemoteDic(config);
  }
  if (config.span) {
    config.span = config.span * 1;
  }
  return config;
};
