export default {
  data: [
    {
      fileName: 'File 1',
      url: ''
    }
  ],
  option: {
    header: false,
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
        label: '规格',
        prop: 'materialSpecifications'
      },
      {
        label: '单位',
        prop: 'baseUnit',
        span: 4
      },
      {
        dicUrl: '/layout/dics/value/enquiryMethod',
        dicMethod: 'get',
        type: 'select',
        label: '报价方式',
        prop: 'quoteMethod'
      },
      {
        label: '含税价',
        prop: 'priceIncludingTax'
      },
      {
        label: '税率',
        prop: 'taxRate'
      },
      {
        label: '不含税价',
        prop: 'priceExcludingTax'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd hh:MM',
        valueFormat: 'yyyy-MM-dd hh:MM',
        label: '报价时间',
        prop: 'createDate'
      }
    ]
  }
};
