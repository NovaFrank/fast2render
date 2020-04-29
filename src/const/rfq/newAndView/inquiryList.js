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
    columnBtn: false,
    searchBtn: false,
    menuAlign: 'left',
    delBtn: false,
    editBtn: false,
    indexLabel: '#',
    border: true,
    highlightCurrentRow: true,
    index: true,
    keyId: 'uuid',
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
        prop: 'toElsAccountList'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        label: '要求交期',
        prop: 'deliveryDate'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        label: '交货日期',
        prop: 'canDeliveryDate'
      }
    ]
  }
};
