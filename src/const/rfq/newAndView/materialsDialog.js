export default {
  data: [],
  option: {
    column: [
      {
        label: '物料编码',
        prop: 'materialNumber',
        editDisplay: false,
        searchSpan: 12,
        search: true
      },
      {
        label: '物料描述',
        prop: 'materialDesc',
        editDisplay: false,
        searchSpan: 12,
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
      },
      {
        label: '工厂编号',
        prop: 'factory'
      }
    ],
    menuBtn: true,
    emptyBtn: false,
    submitBtn: false,
    submitSize: 'medium',
    submitText: '保存',
    menuPosition: 'center',
    highlightCurrentRow: true,
    multiple: false
  },
  page: { total: 0, currentPage: 1, pageSize: 10 }
};
