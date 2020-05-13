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
    menu: true,
    menuAlign: 'center',
    menuWidth: '180',
    addBtn: false,
    editBtn: true,
    delBtn: true,
    refreshBtn: false,
    columnBtn: false,
    // addRowBtn: true,
    // cellBtn: true,
    rowKey: '$index', // todo 需要一个固定的主键，来防止点击行取消时，数据被删
    column: [
      {
        label: '物料编码',
        prop: 'materialNumber',
        disabled: true
      },
      {
        label: '物料描述',
        prop: 'materialDesc',
        disabled: true
      },
      {
        label: '订单项号',
        prop: 'orderItemNumber',
        addDisplay: false,
        editDisplay: false,
        disabled: true
      },
      {
        label: '计划行号',
        prop: 'deliveryItemNumber',
        addDisplay: false,
        editDisplay: false,
        hide: true,
        disabled: true
      },
      {
        label: '规格',
        prop: 'materialSpecifications',
        addDisplay: false,
        editDisplay: false,
        disabled: true
      },
      {
        label: '单位',
        prop: 'baseUnit',
        addDisplay: false,
        editDisplay: false
      },
      {
        label: '需求数量',
        prop: 'quantity',
        type: 'number',
        rules: [
          {
            required: true,
            message: '请输入 需求数量',
            trigger: 'blur'
          }
        ]
      },
      {
        label: 'ELS账号',
        prop: 'elsAccount',
        addDisplay: false,
        editDisplay: false,
        disabled: true
      },
      {
        label: '供应商',
        prop: 'toElsAccount',
        addDisplay: false,
        editDisplay: false,
        disabled: true
      },
      {
        label: '交货日期',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        prop: 'deliveryDate',
        rules: [
          {
            required: true,
            message: '请输入 交货日期',
            trigger: 'blur'
          }
        ]
      },
      {
        label: '含税价',
        prop: 'price'
      },
      {
        label: '不含税价',
        prop: 'noTaxUnitPrice'
      }
    ]
  }
};
