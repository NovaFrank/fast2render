export default {
  data: [
    {
      fileName: 'File 1',
      url: ''
    }
  ],
  option: {
    header: false,
    align: 'center',
    menu: false,
    indexLabel: '#',
    border: true,
    index: true,
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
        label: '供应商ELS账号',
        prop: 'toElsAccount'
      },
      {
        label: '供应商名称',
        prop: 'companyShortName'
      },
      {
        label: '单位',
        prop: 'baseUnit',
        span: 4
      },
      // {
      //   dicUrl: '/layout/dics/value/enquiryMethod',
      //   dicMethod: 'get',
      //   type: 'select',
      //   label: '报价方式',
      //   prop: 'quoteMethod'
      // },
      {
        slot: true,
        label: '含税价',
        prop: 'priceIncludingTax'
      },
      {
        label: '税率',
        prop: 'taxRate'
      },
      {
        slot: true,
        label: '不含税价',
        prop: 'priceExcludingTax'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'timestamp',
        label: '报价时间',
        prop: 'quoteDate'
      }
    ]
  }
};
