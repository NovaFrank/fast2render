import { getStore } from '../lib/store';
import { vaildData, loadJson, loadDic, getObjType, sortArrys, isJSON } from '../lib/utils';
import _ from 'lodash';

let filePath = 'https://config-static.oss-cn-hangzhou.aliyuncs.com/common/';
const fileType = 'block';

const customFilePath = getStore({ name: 'customFilePath' });
if (customFilePath) {
  filePath = customFilePath;
}

export const loadBlockConfig = async (slug, option, type) => {
  const url = `${filePath}${fileType}/${slug}.json`;
  let list = getStore({ name: slug, timer: 1200 });
  const newList = isJSON(list);
  if (newList) {
    list = newList;
  }
  if (list) {
    const result = mergeOption(list, option, type);
    return result;
  } else {
    const list = await loadJson(url, slug);
    return mergeOption(list, option, type);
  }
};

export const checkDic = () => {
  const dic = getStore({ name: 'commondic', timer: 1200 });
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
  const findStr = {
    crud: 'listLayout',
    form: 'detailLayout',
    detail: 'detailLayout'
  };
  const options = list.filter((item) => {
    return item.id === findStr[type];
  });
  const newOption = options[0] || {};
  option = vaildData(newOption, { data: { column: [] } });
  const column = mergeColumn(option.data.column, finalOption.column);
  finalOption = JSON.parse(JSON.stringify(finalOption));
  finalOption.column = handleColumn(column);
  return finalOption;
};

export const handleColumn = (column) => {
  if (!column || !column.length) {
    return [];
  }
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
export const mergeColumn = (remoteColumns = [], localColumns = []) => {
  const remoteItems = {};
  const localItems = {};

  // console.log(':::::::::::::::::::::::::::::::::::::::::');
  // console.log('remote list, ', remoteColumns);
  // console.log('local list, ', localColumns);
  // console.log('================================================================');

  remoteColumns.forEach((remoteColumn, index) => {
    const prop = remoteColumn.prop;
    remoteColumn.orderIndex = index;

    if (!remoteItems[prop]) {
      remoteItems[prop] = remoteColumn;
    } else {
      // 存在重复的，合并属性，先观察下
      console.log('remoteItems duplicate', prop, remoteColumn);

      const newSubItem = _.merge(remoteItems[prop], remoteColumn);
      remoteItems[prop] = newSubItem;
    }
  });

  localColumns.forEach((localColumn, index) => {
    const prop = localColumn.prop;
    localColumn.orderIndex = index;

    if (!localItems[prop]) {
      localItems[prop] = localColumn;
    } else {
      // 存在重复的，合并属性，先观察下
      console.log('localItems duplicate', prop, localColumn);

      const newSubItem = _.merge(localItems[prop], localColumn);
      localItems[prop] = newSubItem;
    }
  });

  const newItems = [];

  for (const remoteItemProp in remoteItems) {
    const remoteItem = remoteItems[remoteItemProp];
    const localItem = localItems[remoteItemProp];
    if (localItem) {
      const orderIndex = remoteItem.orderIndex;
      const newItem = _.merge(remoteItem, localItem);

      newItem.orderIndex = orderIndex;

      localItem.merged = 1;
      // console.log(remoteItemProp, newItem, localItem);

      newItems.push(newItem);
    } else {
      newItems.push(remoteItem);
    }
  }

  // newItems.sort((a, b) => {
  //   if (a.prop > b.prop) {
  //     return 1;
  //   } else if (a.prop < b.prop) {
  //     return -1;
  //   } else {
  //     return 0;
  //   }
  // });

  newItems.sort((a, b) => {
    if (a.orderIndex > b.orderIndex) {
      return 1;
    } else if (a.orderIndex < b.orderIndex) {
      return -1;
    } else {
      return 0;
    }
  });

  for (const prop in localItems) {
    const localItem = localItems[prop];

    if (!localItem.merged) {
      newItems.push(localItem);
    }
  }

  // console.log('newItems');
  // newItems.forEach((item) => {
  //   console.log(item.prop, item);
  // });
  console.log('merged columns', newItems);

  return newItems;
};

export const replaceLocalDic = (config) => {
  const dics = checkDic();

  if (!config.dicUrl.includes('layout/dics') && config.dicUrl.includes('/')) {
    return config;
  }
  // 老的方法 字典 值为  layout/dics/value/
  let slug = config.dicUrl.includes('layout/dics')
    ? config.dicUrl.split('layout/dics/value/')[1]
    : config.dicUrl;
  // 针对新定义的表格字典类型，直接获取slug
  if (config.dicOption === 'static' || config.dicOption === 'remoteDic') {
    slug = config.dicUrl;
  }
  // 新增加属性避免 dicUrl 执行无效请求
  if (config.dicName) {
    slug = config.dicName;
  }
  if (slug && dics && dics[slug]) {
    delete config.dicUrl;
    // dictRangeState
    // 下拉列表选择了部分内容的处理
    const dictList = dics[slug];
    const dictRange = config.dictRange || [];

    if (dictRange.length > 0) {
      const dropdownListRange = [];

      dictList.forEach((item) => {
        if (dictRange.indexOf(item.value) > -1) {
          dropdownListRange.push(item);
        }
      });

      config.dicData = dropdownListRange;
    } else {
      config.dicData = dictList;
    }

    console.log('使用本地词典', config.dicData);
  }
  return config;
};
export const fixRemoteDic = (config) => {
  config.type = 'select';
  const path = config.res ? config.res : 'list';
  config.dicFormatter = (res) => {
    return res.data[path];
  };
  config.props = {
    label: config.dicLabel,
    value: config.dicValue
  };
  if (config.dicQueryStr && config.dicMethod === 'post') {
    try {
      const query = JSON.parse(config.dicQueryStr);
      config.dicQuery = query;
    } catch (err) {
      delete config.dicQuery;
    }
  }
  return config;
};

export const fixColumn = (config) => {
  const type = getObjType(config.order);

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
