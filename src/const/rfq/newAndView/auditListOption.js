export default {
  data: [],
  option: {
    align: 'center',
    menu: false,
    header: false,
    indexLabel: '#',
    border: true,
    index: true,
    column: [
      {
        label: '审批人',
        prop: 'assignee'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'timestamp',
        label: '审批时间',
        prop: 'createDate'
      },
      {
        type: 'select',
        label: '审批结果',
        prop: 'state',
        dicData: [
          { label: '同意', value: 'Completed' },
          { label: '拒绝', value: 'Canceled' },
          { label: '转交', value: 'Forwarded' },
          { label: '回退', value: 'Rollback' },
          { label: '询问', value: 'Quized' },
          { label: '回答', value: 'Replyed' },
          { label: '撤回', value: 'Withdraw' }
        ]
      },
      {
        label: '原因',
        prop: 'opinion'
      }
    ]
  }
};
