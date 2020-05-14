export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    selection: true,
    menuAlign: 'left',
    addBtn: false,
    refreshBtn: false,
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
      {
        label: '需求数量',
        prop: 'quantity'
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
      },
      {
        slot: true,
        label: '报价方式',
        prop: 'quoteMethod'
      }
    ]
  }
};
