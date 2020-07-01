export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    menu: true,
    border: true,
    stripe: true,
    index: true,
    indexLabel: '序号',
    page: false,
    addBtn: false,
    editBtn: false,
    delBtn: false,
    highlightCurrentRow: true,
    align: 'center',
    menuAlign: 'center',
    menuWidth: '130',
    column: [
      {
        label: '订单号',
        prop: 'orderNumber',
        width: 200,
        slot: true,
        editDisplay: false
      },
      {
        label: '供应商ELS账号',
        prop: 'toElsAccount',
        editDisplay: false
      },
      {
        label: '公司名称',
        prop: 'toElsAccountName',
        editDisplay: false
      },
      {
        label: '创建日期',
        prop: 'createDate',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
        editDisplay: false
      },
      {
        label: '订单类型',
        prop: 'orderType',
        editDisplay: false
      },
      {
        label: '采购负责人',
        prop: 'purchasePerson',
        labelWidth: 140,
        formslot: true,
        rules: [
          {
            required: true,
            message: '请输入 采购负责人',
            trigger: 'blur'
          }
        ]
      },
      {
        label: '订单状态',
        prop: 'orderStatus',
        span: 6,
        type: 'select',
        disabled: true,
        editDisplay: false,
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
        editDisplay: false,
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
        editDisplay: false,
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
      },
      {
        label: '审批状态',
        prop: 'auditStatus',
        span: 6,
        type: 'select',
        disabled: true,
        editDisplay: false,
        dicData: [
          {
            label: '审批驳回',
            value: '3'
          },
          {
            label: '审批中',
            value: '2'
          },
          {
            label: '未审批',
            value: '1'
          },
          {
            label: '审批通过',
            value: '0'
          }
        ]
      }
    ]
  }
};
