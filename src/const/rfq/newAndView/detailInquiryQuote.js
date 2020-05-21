export default {
  data: [],
  option: {
    size: 'mini',
    align: 'center',
    header: false,
    menu: false,
    border: false,
    column: [
      {
        span: 8,
        label: '含税价',
        prop: 'priceIncludingTax'
      },
      {
        span: 8,
        label: '税率',
        prop: 'taxRate'
      },
      {
        span: 8,
        label: '不含税价',
        prop: 'priceExcludingTax'
      }
    ]
  }
};
