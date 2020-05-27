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
    refreshBtn: false,
    columnBtn: false,
    addBtn: false,
    indexLabel: '#',
    border: true,
    index: true,
    fit: true,
    column: [
      { label: '物料编号', prop: 'materialNumber' },
      { label: '物料名称', prop: 'materialName' },
      // {
      //   label: '物料描述',
      //   prop: 'materialDesc'
      // },
      { label: '单位', prop: 'baseUnit' },
      { label: '需求数量', prop: 'quantity' },
      { label: '对比项', prop: 'option' }
      // {
      //   label: '供应商',
      //   prop: 'toElsAccount'
      // },
      // {
      //   slot: true,
      //   label: '税率',
      //   prop: 'taxRate'
      // },
      // {
      //   slot: true,
      //   label: '含税价',
      //   prop: 'priceIncludingTax'
      // },
      // {
      //   slot: true,
      //   label: '不含税价',
      //   prop: 'priceExcludingTax'
      // },
      // {
      //   type: 'date',
      //   format: 'yyyy-MM-dd',
      //   valueFormat: 'timestamp',
      //   label: '交货日期',
      //   prop: 'deliveryDate'
      // },
      // {
      //   label: '配额',
      //   prop: 'quota',
      //   cell: true
      // }
    ]
  }
};
