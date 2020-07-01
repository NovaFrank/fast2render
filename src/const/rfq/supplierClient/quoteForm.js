export default {
  data: [],
  option: {
    header: false,
    menu: false,
    emptyBtn: false,
    submitBtn: false,
    indexLabel: '#',
    border: true,
    index: true,
    fit: true,
    column: [
      {
        formslot: true,
        span: 8,
        label: '含税价',
        prop: 'priceIncludingTax'
      },
      {
        formslot: true,
        span: 8,
        label: '税率',
        prop: 'taxRate'
      },
      {
        span: 8,
        label: '不含税价',
        prop: 'priceExcludingTax',
        disabled: true
      }
    ]
  }
};
