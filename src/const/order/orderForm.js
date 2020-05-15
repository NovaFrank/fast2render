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
            required: true,
            message: '请选择订单类型'
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
            required: true,
            message: '请选择采购方负责人'
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
            required: true,
            message: '请选择供应商'
          }
        ]
      },
      {
        label: '供应商名称',
        prop: 'toElsAccountName',
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
            required: true,
            message: '请选择采购类别'
          }
        ]
      },
      {
        label: '采购组',
        prop: 'purchaseGroup',
        span: 6,
        type: 'input',
        formslot: true,
        rules: [
          {
            required: true,
            message: '请选择采购组'
          }
        ]
      },
      {
        label: '订单状态',
        prop: 'orderStatus',
        span: 6,
        type: 'select',
        disabled: true,
        dicData: [
          {
            label: '对方变更退回',
            value: '5'
          },
          {
            label: '变更对方确认',
            value: '4'
          },
          {
            label: '变更对方未确认',
            value: '3'
          },
          {
            label: '对方已退回',
            value: '2'
          },
          {
            label: '对方已确认',
            value: '1'
          },
          {
            label: '订单未确认',
            value: '0'
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
