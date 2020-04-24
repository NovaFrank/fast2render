import _ from 'lodash';
/**
 * 验证表单
 *
 * @param {表单实例} form
 */
export const validForm = (form) => {
  let flag;

  form.validate((valid) => {
    flag = valid;
  });

  return flag;
};

/**
 *
 * @param {所有的数据} data
 * @param {需要合并的列如：[1, 2]} arr
 * @param {通过该字段来区分哪些是要合并的} filed
 * @param {对比的id} id
 * @param {列数} columnIndex
 * @param {行数据} row
 */
export const mySpanMethod = (data, arr, filed, id, columnIndex, row) => {
  // 通过groupBy将数据处理成，需要合并的排在一起。
  let myData = Object.values(_.groupBy(data, filed)).flat();
  let itemArr = []; // 需要合并的数组。
  myData.forEach((item) => {
    if (item[filed] === row[filed]) {
      itemArr.push(item);
    }
  });
  for (let i = 0; i < arr.length; i++) {
    if (columnIndex === arr[i]) {
      // itemArr第一项需要向下合并，其它的不需要。
      if (row[filed] === itemArr[0][filed] && row[id] === itemArr[0][id]) {
        return {
          rowspan: itemArr.length,
          colspan: 1
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
  }
};
