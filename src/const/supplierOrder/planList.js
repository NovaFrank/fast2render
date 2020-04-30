export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    dialogDirection: 'rtl',
    dialogType: 'drawer',
    border: true,
    stripe: true,
    index: false,
    page: false,
    align: 'center',
    menu: false,
    menuAlign: 'center',
    menuWidth: '180',
    addBtn: false,
    editBtn: false,
    delBtn: false,
    refreshBtn: false,
    columnBtn: false,
    column: [
      {
        label: '订单项号',
        prop: 'orderItemNumber'
      },
      {
        label: '计划行号',
        prop: 'deliveryItemNumber'
      },
      {
        label: '要求交期',
        prop: 'requestDeliveryDate',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
        addDisplay: false
      },
      {
        label: '需求数量',
        prop: 'requestDeliveryQuantity'
      },
      {
        label: '计划交货日期',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
        prop: 'replyDeliveryDate',
        addDisplay: false
      },
      {
        label: '计划交货数量',
        prop: 'replyDeliveryQuantity'
      }
    ]
  }
};
