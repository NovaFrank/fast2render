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
        span: 24,
        formslot: true,
        label: '报价',
        prop: 'ladderPriceJson'
      },
      {
        span: 24,
        label: '备注',
        prop: 'remark'
      }
    ]
  }
};
