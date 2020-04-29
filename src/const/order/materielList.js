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
    editBtn: false,
    delBtn: false,
    refreshBtn: false,
    columnBtn: false,
    // addRowBtn: true,
    // cellBtn: true,
    rowKey: '$index', // todo 需要一个固定的主键，来防止点击行取消时，数据被删
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
        label: '规格',
        prop: 'materialSpecifications',
        addDisplay: false
      },
      {
        label: '单位',
        prop: 'baseUnit',
        addDisplay: false
      },
      {
        label: '需求数量',
        prop: 'quantity'
      },
      {
        label: 'ELS账号',
        prop: 'elsAccount',
        addDisplay: false
      },
      {
        label: '供应商',
        prop: 'toElsAccount',
        addDisplay: false
      },
      {
        label: '交货日期',
        type: 'deliveryDate',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
        prop: 'receivedTime',
        addDisplay: false
      },
      {
        label: '含税价',
        prop: 'orderAmountTax'
      },
      {
        label: '不含税价',
        prop: 'orderAmount',
        addDisplay: false
      }
    ]
  }
};
