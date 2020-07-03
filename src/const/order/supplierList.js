export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    indexLabel: '序号',
    indexFixed: false,
    searchShow: true,
    searchBtn: true,
    columnBtn: false,
    align: 'center',
    menu: false,
    border: true,
    highlightCurrentRow: true,
    selection: true,
    stripe: true,
    page: true,
    addBtn: false,
    editBtn: false,
    delBtn: false,
    index: true,
    sortable: true,
    // tip: false,
    indeterminate: true,
    column: [
      {
        label: '供应商ELS号',
        prop: 'toElsAccount',
        searchLabelWidth: 130,
        overHidden: true,
        search: true,
        searchSpan: 12
      },
      {
        label: '供应商名称',
        prop: 'toElsAccountName',
        labelWidth: 130,
        overHidden: true
        // supplierName
      }
    ]
  }
};
