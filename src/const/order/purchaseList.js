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
        label: '子账号',
        prop: 'elsSubAccount',
        overHidden: true
      },
      {
        label: '姓名',
        prop: 'name',
        overHidden: true
      }
    ]
  }
};
