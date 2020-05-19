export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    // selection: true,
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
    searchBtn: false,
    menu: false,
    menuAlign: 'left',
    indexLabel: '序号',
    border: true,
    highlightCurrentRow: true,
    index: true,
    selectable: (row, index) => {
      console.log(row, index);
    },
    column: [
      {
        slot: true,
        label: '询价单号',
        prop: 'enquiryNumber'
      },
      {
        label: '物料编号',
        prop: 'materialNumber'
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      {
        dicUrl: '/layout/dics/value/enquiryMethod',
        dicMethod: 'get',
        type: 'select',
        label: '报价方式',
        prop: 'quoteMethod'
      },
      {
        label: '需求数量',
        prop: 'quantity'
      },
      {
        dicUrl: '/layout/dics/value/enquiryType',
        dicMethod: 'get',
        type: 'select',
        label: '询价类型',
        prop: 'enquiryType'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        label: '询价日期',
        prop: 'createDate'
      },
      {
        type: 'datetime',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        label: '报价截止时间',
        prop: 'quoteEndTime'
      },
      {
        label: '采购负责人',
        prop: 'createUser'
      },
      {
        label: '采购商名称',
        prop: 'createUser'
      },
      {
        slot: true,
        label: '状态',
        prop: 'itemStatus'
      }
    ]
  }
};
