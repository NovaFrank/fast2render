export default {
  data: [],
  option: {
    column: [
      {
        label: '物料编码',
        prop: 'materialNumber',
        editDisplay: false,
        search: true
      },
      {
        label: '物料描述',
        prop: 'materialDesc',
        editDisplay: false,
        search: true
      },
      {
        label: '规格',
        prop: 'materialSpecifications',
        editDisplay: false
      },
      {
        label: '单位',
        prop: 'baseUnit',
        editDisplay: false
      }
      // {
      //   label: '预估单价',
      //   prop: 'budgetPrice'
      // }
    ],
    menuBtn: true,
    emptyBtn: false,
    submitBtn: false,
    submitSize: 'medium',
    submitText: '保存',
    menuPosition: 'center',
    highlightCurrentRow: true,
    searchMenuSpan: 6,
    multiple: false
  },
  page: { total: 0, currentPage: 1, pageSize: 10 }
};
