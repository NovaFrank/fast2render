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
    indexLabel: '#',
    border: true,
    highlightCurrentRow: true,
    index: true,
    column:[
      {
        label: '物料编号',
        prop: 'materialNo',
      }, {
        label: '物料描述',
        prop: 'materialDesc',
      }, {
        label: '规格',
        prop: 'standards',
      }, {
        label: '单位',
        prop: 'unit',
      }, {
        label: '要求交期',
        prop: 'requireTime',
      }, {
        label: '需求数量',
        prop: 'count',
      }, {
        label: 'ELS账号',
        prop: 'elsCount',
      }, {
        label: '供应商',
        prop: 'supplier',
      }, {
        label: '交货日期',
        prop: 'deadline',
      }, {
        label: '报价方式',
        prop: 'quoteType',
      }, {
        label: '设置成本报价',
        prop: 'setQuote',
      }
    ]
  },
}
