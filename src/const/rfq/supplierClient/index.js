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
      //   label: '询价类型',
      //   prop: 'enquiryType'
      // },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      {
        label: '需求数量',
        prop: 'quantity'
      },
      // {
      //   type: 'date',
      //   format: 'yyyy-MM-dd',
      //   label: '询价日期',
      //   prop: 'beginDate'
      // },
      // {
      //   type: 'datetime',
      //   format: 'yyyy-MM-dd hh:mm:ss',
      //   label: '截止时间',
      //   prop: 'quoteEndTime'
      // },
      {
        label: '采购负责人',
        prop: 'responsible'
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
