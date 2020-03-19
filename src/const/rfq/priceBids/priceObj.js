export default {
  option: {
    prop: 'group',
    column: [
      {
        label: '询价单号',
        prop: 'no'
      },
      {
        label: '询价时间',
        prop: 'inquiryTime'
      },
      {
        label: '运营中心',
        prop: 'center'
      },
      {
        label: '货币',
        prop: 'currency'
      },
      {
        label: '策略',
        prop: 'strategy'
      }
    ]
  },
  optionBottom: {
    prop: 'group',
    column: [
      {
        label: '上次成交价',
        prop: 'dealPrice'
      },
      {
        label: '上次成交时间',
        prop: 'dealTime'
      },
      {
        label: '上次成交供应商',
        prop: 'dealSupplier'
      }
    ]
  }
};
