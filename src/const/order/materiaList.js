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
    refreshBtn: false,
    column: [
      {
        prop: 'materialNumber',
        label: '物料编码',
        overHidden: true
      },
      {
        label: '物料名称',
        prop: 'materialDesc',
        overHidden: true
      },
      {
        label: '含税单价',
        prop: 'priceIncludingTax',
        overHidden: true,
        addDisplay: false,
        editDisplay: false
      },
      {
        label: '税率',
        prop: 'taxRate',
        overHidden: true,
        addDisplay: false,
        editDisplay: false
      }
    ]
  }
};
