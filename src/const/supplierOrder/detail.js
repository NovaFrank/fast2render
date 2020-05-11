export default {
  obj: {},
  option: {
    menuPosition: 'left',
    labelWidth: 120,
    menuBtn: false,
    column: [
      {
        label: '订单单号',
        prop: 'orderNumber',
        span: 6,
        type: 'input',
        disabled: true
      },
      {
        label: '采购方名称',
        prop: 'elsAccountName',
        span: 6,
        type: 'select',
        placeholder: ' ',
        disabled: true
      },
      {
        label: '采购方负责人',
        prop: 'purchasePerson',
        span: 6,
        type: 'input',
        placeholder: ' ',
        disabled: true
      },
      {
        label: '销售方负责人',
        prop: 'salePerson',
        span: 6,
        type: 'input',
        placeholder: ' ',
        disabled: true
      },
      {
        label: '采购方ELS',
        prop: 'toElsAccount',
        span: 6,
        type: 'input',
        disabled: true
      },
      {
        label: '订单状态',
        prop: 'orderStatus',
        span: 6,
        type: 'select',
        disabled: true,
        dicData: [
          {
            label: '已确认',
            value: '1'
          },
          {
            label: '未确认',
            value: '0'
          }
        ]
      },
      {
        label: '订单交收状态',
        prop: 'deliveryStatus',
        span: 6,
        type: 'select',
        disabled: true,
        dicData: [
          {
            label: '超量交收',
            value: '4'
          },
          {
            label: '全部交收',
            value: '3'
          },
          {
            label: '部分交收',
            value: '2'
          },
          {
            label: '订单发货在途',
            value: '1'
          },
          {
            label: '未交收',
            value: '0'
          }
        ]
      }
    ]
  }
};
