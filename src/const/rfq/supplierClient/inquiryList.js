export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    align: 'center',
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
      // {
      //   // dicUrl: '/layout/dics/value/enquiryMethod',
      //   // dicMethod: 'get',
      //   // type: 'select',
      //   slot: true,
      //   label: '报价方式',
      //   prop: 'quoteMethod'
      // },
      // {
      //   slot: true,
      //   label: '阶梯信息',
      //   prop: 'quoteMethodInfo'
      // },
      // {
      //   slot: true,
      //   label: '成本模板',
      //   prop: 'costTemplate'
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
        slot: true,
        label: '是否报价',
        type: 'switch',
        prop: 'quote'
      },
      {
        label: '报价时间',
        type: 'datetime',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'timestamp',
        prop: 'quoteDate'
      }
    ]
  }
};
