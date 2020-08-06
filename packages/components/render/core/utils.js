import { validateNull } from '../../../lib/validate';
import { getApiPath } from '../../../lib/utils.js';

const fixSelectDic = [{ from: 'taxCode', to: 'taxRate' }];
const baseUrl = getApiPath();
export const getFilePath = () => {
  let projectPath;
  if (top.location.pathname) {
    projectPath = top.location.pathname.split('/')[1];
  }
  if (projectPath) {
    return '/' + projectPath + '/opt/nfsshare/';
  } else {
    return 'http://cs.51qqt.com/opt/nfsshare/';
  }
};

export const checkFixDic = (item, list) => {
  fixSelectDic.map((dicItem) => {
    if (dicItem.from === item.prop) {
      item.type = 'select';
      item.datatype = 'fixBizDic';
      item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.prop}`;
    }
  });
};

export const checkDataType = (item) => {
  const dateList = ['noteDate', 'deliveryDate', 'confirmDate', 'needDate'];
  const dateTimeList = ['createDate', 'lastUpdateDate', 'validUntilTime'];

  if (dateList.includes(item.prop)) {
    item.datatype = 'date';
  }
  if (dateTimeList.includes(item.prop)) {
    item.datatype = 'datetime';
  }

  switch (item.datatype) {
    case 'popup':
      item.formslot = true;
      item.slot = true;
      break;
    case 'popupName':
      item.disabled = 'disabled';
      break;
    case 'uploadImg':
      item.disabled = 'disabled';
      item.component = 'fast2-upload';
      break;
    case 'data':
    case 'date':
      item.type = 'date';
      item.format = 'yyyy-MM-dd';
      item.valueFormat = 'timestamp';
      break;
    case 'datatime':
    case 'datetime':
      item.type = 'datetime';
      item.format = 'yyyy-MM-dd HH:mm:ss';
      item.valueFormat = 'timestamp';
      break;
    case 'price':
      item.type = 'number';
      item.precision = 2;
      break;
    case 'bizDic':
      item.type = 'select';
      item.bizDic = item.bizDic || item.prop;
      break;
    default:
  }
  this.itemLinkList.map((linkItem) => {
    if (item.prop === linkItem.prop) {
      item.formslot = true;
      item.slot = true;
    }
  });

  if (!validateNull(item.bizDic)) {
    delete item.dicMethod;
    delete item.props;
    item.type = 'select';
    item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
  }
};

export const checkDataTypeItem = (originItem, item) => {
  const dateList = ['noteDate', 'deliveryDate', 'confirmDate', 'needDate'];
  const datetimeList = ['createDate', 'lastUpdateDate', 'validUntilTime'];

  if (!originItem || originItem === -1) {
    return false;
  }

  Object.assign(item, originItem);

  if (dateList.includes(item.prop)) {
    item.datatype = 'date';
  }

  if (datetimeList.includes(item.prop)) {
    item.datatype = 'datetime';
  }

  switch (item.datatype) {
    case 'readonly':
    case 'popupName':
      item.disabled = 'disabled';
      break;
    case 'date':
      item.type = 'date';
      item.format = 'yyyy-MM-dd';
      item.valueFormat = 'timestamp';
      break;
    case 'datatime':
    case 'datetime':
      item.type = 'datetime';
      item.format = 'yyyy-MM-dd HH:mm:ss';
      item.valueFormat = 'timestamp';
      break;
    case 'price':
      item.type = 'number';
      item.precision = 2;
      break;
    case 'bizDic':
      item.type = 'select';
      item.bizDic = item.bizDic || item.prop;
      break;
    default:
  }

  if (originItem.datatype === 'popup' && !originItem.ref) {
    item.formslot = true;
  }

  if (originItem.ref) {
    item.disabled = 'disabled';
  }

  if (item.isSystem === 'Y') {
    item.display = false;
    item.rules = [];
  }

  if (!validateNull(item.bizDic)) {
    delete item.dicData;
    delete item.dicMethod;
    delete item.props;
    item.type = 'select';
    item.dicUrl = `${baseUrl}/ElsSearchDictionaryService/no-auth/dict/${item.bizDic}`;
  }
};
