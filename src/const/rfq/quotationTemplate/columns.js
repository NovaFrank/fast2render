export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    refreshBtn: false,
    columnBtn: false,
    searchBtn: false,
    menu: true,
    menuAlign: 'left',
    indexLabel: '#',
    border: true,
    highlightCurrentRow: true,
    index: true,
    column: [
      {
        label: '成本名',
        prop: 'costName'
      },
      {
        label: '供应商报价？',
        prop: 'quote'
      }
    ]
  }
};
