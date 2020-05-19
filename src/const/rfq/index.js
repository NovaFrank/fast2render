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
        label: '询价单号',
        prop: 'enquiryNumber'
      },
      // {
      //   slot: true,
      //   label: '状态',
      //   prop: 'status'
      // },
      {
        label: '供应商ELS账号',
        prop: 'toElsAccount'
      },
      // {
      //   label: '公司名称',
      //   prop: 'companyShortName'
      // },
      {
        label: '物料编码',
        prop: 'materialNumber'
      },
      {
        label: '物料名称',
        prop: 'materialName'
      },
      // {
      //   label: '物料描述',
      //   prop: 'materialDesc'
      // },
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
        valueFormat: 'timestamp',
        label: '询价日期',
        prop: 'createDate'
      },
      {
        type: 'datetime',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        label: '报价截止日期',
        prop: 'quoteEndTime'
      },
      {
        label: '数量',
        prop: 'quantity'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        label: '交货日期',
        prop: 'canDeliveryDate'
      },
      {
        label: '创建人',
        prop: 'createUser'
      }
    ]
  }
};
