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
    menu: false,
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
        formslot: true,
        rules: [
          {
            required: true,
            message: '请输入 物料编码',
            trigger: 'blur'
          }
        ]
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      {
        label: '订单项号',
        prop: 'orderItemNumber',
        addDisplay: false,
        editDisplay: false
      },
      {
        label: '计划行号',
        prop: 'deliveryItemNumber',
        addDisplay: false,
        editDisplay: false,
        hide: true
      },
      {
        label: '规格',
        prop: 'materialSpecifications',
        addDisplay: false,
        editDisplay: false
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
        label: '含税单价',
        prop: 'price',
        type: 'number',
        rules: [
          {
            required: true,
            message: '请输入 含税单价',
            trigger: 'blur'
          }
        ]
      },
      {
        label: '总金额',
        prop: 'totalAmount',
        type: 'number',
        rules: [
          {
            required: true,
            message: '请输入 总金额',
            trigger: 'blur'
          }
        ]
      },
      {
        label: 'ELS账号',
        prop: 'elsAccount',
        addDisplay: false,
        editDisplay: false
      },
      {
        label: '供应商',
        prop: 'toElsAccount',
        addDisplay: false,
        editDisplay: false
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
      }
    ]
  }
};
