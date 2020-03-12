export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
    searchBtn: false,
    menu: true,
    menuAlign: 'left',
    delBtn: false,
    editBtn: false,
    indexLabel: '序号',
    border: true,
    highlightCurrentRow: true,
    index: true,
    column:[
      {
        label: '询价单号',
        prop: 'whetherDefault',
      }, {
        label: '业务类型',
        prop: 'fromBusiness',
      }, {
        label: '业务类型描述',
        prop: 'fromDesc',
      }
    ]
  },
}
