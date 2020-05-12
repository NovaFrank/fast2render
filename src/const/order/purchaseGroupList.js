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
    searchShow: false,
    searchBtn: false,
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
    tip: false,
    indeterminate: true,
    column: [
      {
        label: '采购组编码',
        prop: 'orgCategoryId',
        overHidden: true
      },
      {
        label: '采购组描述',
        prop: 'orgCategoryDesc',
        overHidden: true
      }
    ]
  }
};
