export default {
  column: [
    { label: '询价单号', span: 6, prop: 'enquiryNumber', disabled: true },
    { label: '询价名称', span: 6, prop: 'enquiryDesc', disabled: true },
    {
      type: 'select',
      dicUrl: '/layout/dics/value/enquiryType',
      dicMethod: 'get',
      formslot: true,
      label: '询价类型',
      span: 6,
      prop: 'enquiryType',
      disabled: true
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
      label: '询价日期',
      span: 6,
      prop: 'createDate',
      disabled: true
    },
    {
      type: 'datetime',
      display: true,
      format: 'yyyy-MM-dd HH:mm:ss',
      valueFormat: 'timestamp',
      label: '报价截止时间',
      span: 6,
      prop: 'quoteEndTime',
      disabled: true
    },
    { label: '负责人', span: 6, prop: 'createUser', disabled: true }
  ],
  labelWidth: 120,
  menuBtn: false
};
