export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    addBtn: false,
    refreshBtn: false,
    menu: false,
    indexLabel: '#',
    border: true,
    highlightCurrentRow: true,
    index: true,
    keyId: 'uuid',
    cellBtn: true,
    fit: true,
    column: [
      {
        label: '物料编号',
        prop: 'materialNumber'
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      {
        label: '规格',
        prop: 'materialSpecifications'
      },
      {
        label: '单位',
        prop: 'baseUnit',
        span: 4
      },
      // {
      //   label: '要求交期',
      //   prop: 'requireTime'
      // },
      // {
      //   label: '需求数量',
      //   prop: 'count'
      // },
      // {
      //   label: 'ELS账号',
      //   prop: 'elsAccount'
      // },
      {
        label: '供应商',
        prop: 'toElsAccount'
      },
      {
        type: 'select',
        label: '状态',
        prop: 'itemStatus',
        dicData: [
          { label: '已报价', value: '2' },
          { label: '报价中', value: '1' },
          { label: '已接受', value: '4' },
          { label: '已拒绝', value: '5' },
          { label: '重报价', value: '3' }
        ]
      },
      {
        slot: true,
        label: '税率',
        prop: 'taxRate'
      },
      {
        width: 300,
        slot: true,
        label: '报价',
        prop: 'priceIncludingTax'
      },
      {
        label: '交货日期',
        prop: 'deliveryDate'
      },
      {
        slot: true,
        label: '操作',
        prop: 'option'
      },
      {
        label: '配额',
        prop: 'quota',
        cell: true
      }
    ]
  }
};
