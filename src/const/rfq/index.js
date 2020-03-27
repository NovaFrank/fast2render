export default {
  data: [
    {
      inquiryNo: 'inquiryNo',
      inquiryType: 'inquiryType',
      elsCount: 'elsCount'
    },
    {
      inquiryNo: 'inquiryNo',
      inquiryType: 'inquiryType',
      elsCount: 'elsCount'
    }
  ],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    selection: true,
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
        prop: 'inquiryNo'
      },
      {
        label: '询价类型',
        prop: 'inquiryType'
      },
      {
        label: 'ELS账号',
        prop: 'elsCount'
      },
      {
        label: '公司名称',
        prop: 'companyName'
      },
      {
        label: '询价日期',
        prop: 'inquiryTime'
      },
      {
        label: '报价截止日期',
        prop: 'quoteDeadline'
      },
      {
        label: '物料名称',
        prop: 'materialName'
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      {
        label: '数量',
        prop: 'count'
      },
      {
        label: '交货日期',
        prop: 'deadline'
      },
      {
        label: '创建人',
        prop: 'creator'
      }
    ]
  }
};
