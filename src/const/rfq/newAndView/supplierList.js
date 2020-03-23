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
    addBtn: false,
    editBtn: false,
    indexLabel: '#',
    border: true,
    highlightCurrentRow: true,
    index: true,
    column: [
      {
        label: '供应商ELS账号',
        prop: 'elsCount'
      },
      {
        label: '供应商名称',
        prop: 'supplierName'
      }
    ]
  }
};
