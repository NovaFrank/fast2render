export default {
  column: [
    {
      label: '询价类型',
      span: 6,
      prop: 'formBusiness'
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
      label: '询价日期',
      span: 6,
      prop: 'inquiryTime'
    },
    {
      formslot: true,
      type: 'date',
      display: true,
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
      label: '截止日期',
      span: 6,
      prop: 'quoteDeadline'
    },
    {
      label: '负责人',
      span: 6,
      prop: 'inCharge'
    },
    {
      label: '备注',
      prop: 'mark'
    }
  ],
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false,
  submitSize: 'medium',
  submitText: '保存',
  menuPosition: 'center'
};
