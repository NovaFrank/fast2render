export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    align: 'center',
    menu: false,
    indexLabel: '#',
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
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
        label: '物料名称',
        prop: 'materialName'
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
      {
        label: '需求数量',
        prop: 'quantity'
      },
      {
        slot: true,
        label: '报价方式',
        prop: 'quoteMethod'
      },
      {
        slot: true,
        label: '阶梯信息',
        prop: 'quoteMethodInfo'
      },
      {
        slot: true,
        label: '成本模板',
        prop: 'costTemplate'
      },
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
      // {
      //   width: 300,
      //   slot: true,
      //   label: '报价',
      //   prop: 'priceIncludingTax'
      // },
      {
        slot: true,
        label: '含税价',
        prop: 'priceIncludingTax'
      },
      {
        slot: true,
        label: '不含税价',
        prop: 'priceExcludingTax'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
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
