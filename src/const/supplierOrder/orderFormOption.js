export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    menu: false,
    border: true,
    stripe: true,
    index: true,
    indexLabel: '序号',
    page: false,
    addBtn: false,
    editBtn: false,
    highlightCurrentRow: true,
    align: 'center',
    menuAlign: 'center',
    menuWidth: '80',
    column: [
      {
        label: '订单号',
        prop: 'orderNumber',
        slot: true
      },
      {
        label: '订单类型',
        prop: 'orderType'
      },
      {
        label: '创建日期',
        prop: 'createDate',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd'
      },
      {
        label: '供方负责人',
        prop: 'salePerson'
      },
      {
        label: '采购负责人',
        prop: 'purchasePerson'
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
            value: 3
          },
          {
            label: '变更未发送',
            value: 2
          },
          {
            label: '已发送',
            value: 1
          },
          {
            label: '未发送',
            value: 0
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
            value: 4
          },
          {
            label: '全部交收',
            value: 3
          },
          {
            label: '部分交收',
            value: 2
          },
          {
            label: '订单发货在途',
            value: 1
          },
          {
            label: '未交收',
            value: 0
          }
        ]
      }
    ]
  }
};
