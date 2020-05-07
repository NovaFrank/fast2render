export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    // menu: false,
    editBtn: false,
    delBtn: false,
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
        label: '要求交期',
        prop: 'requireTime'
      },
      {
        label: '需求数量',
        prop: 'count'
      },
      {
        label: '交货日期',
        prop: 'deliveryDate'
      },
      {
        // dicUrl: '/layout/dics/value/enquiryMethod',
        // dicMethod: 'get',
        // type: 'select',
        slot: true,
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
        slot: true,
        label: '是否报价',
        type: 'switch',
        prop: 'quote'
      }
    ]
  }
};
