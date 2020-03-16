export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
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
    // editBtn: false,
    // addRowBtn: true,
    // cellBtn: true,
    rowKey: '$index', // todo 需要一个固定的主键，来防止点击行取消时，数据被删
    column: [
      {
        label: '物料编码',
        prop: 'materialNumber',
        slot: true
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      {
        label: '规格',
        prop: 'materialSpec'
      },
      {
        label: '单位',
        prop: 'unitQuantity'
      },
      {
        label: '要求交期',
        prop: 'deliveryDate'
      },
      {
        label: '需求数量',
        prop: 'quantity'
      },
      {
        label: 'ELS账号',
        prop: 'elsAccount'
      },
      {
        label: '供应商',
        prop: 'elsName'
      },
      {
        label: '交货日期',
        prop: 'receivedTime'
      },
      {
        label: '含税价',
        prop: 'budgetPrice'
      },
      {
        label: '不含税价',
        prop: 'nobudgetPrice'
      }
    ]
  }
};
