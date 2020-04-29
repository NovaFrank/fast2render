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
        label: 'ELS账号',
        prop: 'elsAccount'
      },
      // {
      //   label: '公司名称',
      //   prop: 'companyShortName'
      // },
      // {
      //   label: '询价日期',
      //   prop: 'beginDate'
      // },
      // {
      //   label: '报价截止日期',
      //   prop: 'endDate'
      // },
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
        prop: 'quantity'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
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
