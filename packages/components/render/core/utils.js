
import { validateNull } from '../../../lib/validate';

export const getApiPath = () => {
  let projectPath;
  if (top.location.pathname) {
    projectPath = top.location.pathname.split('/')[1];
  }

  if (projectPath) {
    return '/' + projectPath + '/apis';
  } else {
    return '/apis';
  }
};


 export const  checkDataType = (item) {
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
          item.component ='fast2-upload'
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
    }
