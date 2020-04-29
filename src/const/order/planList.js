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
    index: true,
    indexLabel: '序号',
    page: false,
    align: 'center',
    menuAlign: 'center',
    menuWidth: '180',
    addBtn: false,
    editBtn: false,
    delBtn: false,
    refreshBtn: false,
    columnBtn: false,
    column: [
      {
        label: '物料编码',
        prop: 'materialNumber',
        formslot: true
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
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
