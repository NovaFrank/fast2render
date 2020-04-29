export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    menu: false,
    border: true,
    stripe: true,
    index: true,
    indexLabel: '序号',
    page: false,
    addBtn: false,
    editBtn: false,
    highlightCurrentRow: true,
    align: 'center',
    menuAlign: 'center',
    menuWidth: '80',
    column: [
      {
        label: '订单号',
        prop: 'orderNumber',
        slot: true
      },
      {
        label: 'ELS账号',
        prop: 'elsAccount'
      },
      {
        label: '公司名称',
        prop: 'elsAccountName'
      },
      {
        label: '创建日期',
        prop: 'createDate',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd'
      },
      {
        label: '订单类型',
        prop: 'orderType'
      },
      {
        label: '采购负责人',
        prop: 'purchasePerson'
      },
      {
        label: '订单状态',
        prop: 'orderStatus'
      }
    ]
  }
};
