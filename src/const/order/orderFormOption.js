export default {
  data: [
    {
      orderNumber: '123345',
      elsAccount: '000000',
      supplierName: 'iek'
    }
  ],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 20
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
        prop: 'supplierName'
      },
      {
        label: '创建日期',
        prop: 'createDate'
      },
      {
        label: '时间戳',
        prop: 'unix'
      },
      {
        label: '订单类型',
        prop: 'orderType'
      },
      {
        label: '采购负责人',
        prop: 'purchasePerson'
      }
    ]
  }
};
