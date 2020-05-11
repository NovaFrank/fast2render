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
        label: '订单类型',
        prop: 'orderType',
        span: 6,
        type: 'select',
        disabled: true
      },
      {
        label: '采购方负责人',
        prop: 'purchasePerson',
        span: 6,
        type: 'input',
        disabled: true
      },
      {
        label: '供应商',
        prop: 'toElsAccount',
        span: 6,
        type: 'input',
        disabled: true
      },
      {
        label: '供应商名称',
        prop: 'toElsAccountName',
        span: 6,
        type: 'input',
        disabled: true
      },
      {
        label: '采购类别',
        prop: 'purchaseType',
        span: 6,
        type: 'select',
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
            value: 1
          },
          {
            label: '未确认',
            value: 0
          }
        ]
      },
      {
        label: '订单发送状态',
        prop: 'sendStatus',
        span: 6,
        type: 'select',
        disabled: true,
        dicData: [
          {
            label: '变更已发送',
            value: '3'
          },
          {
            label: '变更未发送',
            value: '2'
          },
          {
            label: '已发送',
            value: '1'
          },
          {
            label: '未发送',
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
