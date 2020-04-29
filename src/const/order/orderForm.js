export default {
  obj: {},
  option: {
    menuPosition: 'left',
    labelWidth: 120,
    menuBtn: false,
    column: [
      // {
      //   label: '订单单号',
      //   prop: 'orderNumber',
      //   span: 6,
      //   type: 'input',
      //   disabled: true,
      //   placeholder: ' '
      // },
      {
        label: '订单类型',
        prop: 'orderType',
        span: 6,
        type: 'select',
        dicData: [],
        // dicUrl: '/layout/dics/value/orderType',
        // dicMethod: 'get',
        rules: [
          {
            required: true
          }
        ]
      },
      {
        label: '采购方负责人',
        prop: 'purchasePerson',
        span: 6,
        type: 'input',
        formslot: true,
        rules: [
          {
            required: true
          }
        ]
      },
      {
        label: '供应商',
        prop: 'toElsAccount',
        span: 6,
        type: 'input',
        formslot: true,
        rules: [
          {
            required: true
          }
        ]
      },
      {
        label: '供应商名称',
        prop: 'supplierName',
        span: 6,
        type: 'input'
      },
      {
        label: '采购类别',
        prop: 'purchaseType',
        span: 6,
        type: 'select',
        dicData: [],
        // dicUrl: '/layout/dics/value/purchaseType',
        // dicMethod: 'get',
        rules: [
          {
            required: true
          }
        ]
      }
      // {
      //   label: '采购组',
      //   prop: 'purchaseGroup',
      //   span: 6,
      //   type: 'select',
      //   rules: [
      //     {
      //       required: true
      //     }
      //   ]
      // }
    ]
  }
};
