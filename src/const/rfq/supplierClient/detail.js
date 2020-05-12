export default {
  column: [
    {
      label: '询价单号',
      span: 6,
      prop: 'enquiryNumber',
      disabled: true
    },
    {
      type: 'select',
      // dicData: DIC.TABLE_CONFIG_DEFAULT,
      dicUrl: '/layout/dics/value/enquiryType',
      dicMethod: 'get',
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
      prop: 'beginDate',
      disabled: true
    },
    {
      type: 'datetime',
      display: true,
      format: 'yyyy-MM-dd hh:mm:ss',
      valueFormat: 'timestamp',
      label: '报价截止时间',
      span: 6,
      prop: 'quoteEndTime',
      disabled: true
    },
    {
      label: '负责人',
      span: 6,
      prop: 'responsible',
      disabled: true
    }
    // {
    //   label: '备注',
    //   prop: 'mark'
    // }
  ],
  labelWidth: 120,
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false
};
