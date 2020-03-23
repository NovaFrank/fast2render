export default {
  data: [
    {
      elsCount: 'ELS账号',
      supplierName: '1',
      type: ''
    },
    {
      elsCount: '2',
      prsupplierNameop2: '2',
      type: ''
    }
  ],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    column: [
      { label: 'ELS账号', prop: 'elsCount' },
      { label: '供应商名称', prop: 'supplierName' },
      { label: '供应商类别', prop: 'type' }
    ]
  }
};
