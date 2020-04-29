export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    menu: false,
    indexLabel: '#',
    border: true,
    // highlightCurrentRow: true,
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
      {
        label: 'ELS账号',
        prop: 'elsAccount'
      },
      {
        label: '供应商',
        prop: 'toElsAccount'
      },
      {
        label: '税率',
        prop: 'taxRate'
      },
      {
        label: '报价',
        prop: 'price'
      },
      {
        label: '交货日期',
        prop: 'deliveryDate'
      },
      {
        slot: true,
        label: '操作',
        prop: 'itemStatus'
      },
      {
        label: '配额',
        prop: 'quota',
        cell: true
      }
    ]
  }
};
