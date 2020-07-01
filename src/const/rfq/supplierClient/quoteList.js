export default {
  data: [],
  option: {
    header: false,
    align: 'center',
    menu: false,
    emptyBtn: false,
    submitBtn: false,
    indexLabel: '#',
    border: true,
    index: true,
    fit: true,
    keyId: 'ladderGrade',
    cellBtn: true,
    column: [
      {
        label: '阶梯',
        prop: 'ladderGrade'
      },
      {
        slot: true,
        label: '含税价',
        prop: 'priceIncludingTax'
      },
      {
        slot: true,
        label: '税率',
        prop: 'taxRate'
      },
      {
        label: '不含税价',
        prop: 'priceExcludingTax'
      }
    ]
  }
};
