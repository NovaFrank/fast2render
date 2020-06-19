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
      { label: '物料编号', prop: 'materialNumber' },
      { label: '物料名称', prop: 'materialName' },
      { label: '物料描述', prop: 'materialDesc' },
      { label: '单位', prop: 'baseUnit', span: 4 },
      { label: '需求数量', prop: 'quantity' },
      { slot: true, label: '报价方式', prop: 'quoteMethod' },
      { slot: true, label: '阶梯信息', prop: 'quoteMethodInfo' },
      { slot: true, label: '成本模板', prop: 'costTemplate' },
      { label: '供应商', prop: 'companyShortName' },
      {
        type: 'select',
        label: '供应商状态',
        prop: 'supplierType',
        dicData: [
          { label: '合格供应商', value: '1' },
          { label: '潜在供应商', value: '2' },
          { label: '陌生供应商', value: '3' },
          { label: '淘汰供应商', value: '4' }
        ]
      },
      {
        type: 'select',
        label: '状态',
        prop: 'itemStatus',
        dicData: [
          { label: '报价中', value: '1' },
          { label: '已报价', value: '2' },
          { label: '重报价', value: '3' },
          { label: '已接受', value: '4' },
          { label: '已拒绝', value: '5' },
          { label: '已关闭', value: '6' }
        ]
      },
      { slot: true, label: '税率', prop: 'taxRate' },
      { slot: true, label: '含税价', prop: 'priceIncludingTax' },
      { slot: true, label: '不含税价', prop: 'priceExcludingTax' },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        label: '交货日期',
        prop: 'deliveryDate'
      },
      { label: '配额', prop: 'quota' }
    ]
  }
};
