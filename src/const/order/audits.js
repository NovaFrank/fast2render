export default {
  data: [],
  option: {
    header: false,
    border: true,
    stripe: true,
    page: false,
    addBtn: false,
    menu: false,
    align: 'center',
    menuAlign: 'center',
    menuWidth: '180',
    column: [
      {
        label: '审批人',
        prop: 'owner'
      },
      {
        label: '审批时间',
        prop: 'endDate',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp'
      },
      {
        label: '审批结果',
        prop: 'state'
      },
      {
        label: '原因',
        prop: 'opinion'
      }
    ]
  }
};
