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
    keyId: 'ladderGrade',
    cellBtn: true,
    column: [
      {
        label: '阶梯',
        prop: 'ladderGrade'
      },
      {
        label: '含税价',
        prop: 'priceIncludingTax',
        cell: true
      },
      {
        label: '税率',
        prop: 'taxRate',
        cell: true
      },
      {
        label: '不含税价',
        prop: 'priceExcludingTax',
        cell: true
      }
    ]
  }
};
