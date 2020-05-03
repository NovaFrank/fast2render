export default {
  column: [
    {
      label: '询价单号',
      span: 6,
      prop: 'enquiryNumber'
    },
    {
      type: 'select',
      // dicData: DIC.TABLE_CONFIG_DEFAULT,
      dicUrl: '/layout/dics/value/enquiryType',
      dicMethod: 'get',
      label: '询价类型',
      span: 6,
      prop: 'enquiryType'
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
      label: '询价日期',
      span: 6,
      prop: 'beginDate'
    },
    {
      formslot: true,
      type: 'datetime',
      display: true,
      format: 'yyyy-MM-dd hh:mm:ss',
      valueFormat: 'timestamp',
      label: '报价截止时间',
      span: 6,
      prop: 'quoteEndTime'
    },
    {
      label: '负责人',
      span: 6,
      prop: 'responsible'
    }
    // {
    //   label: '备注',
    //   prop: 'mark'
    // }
  ],
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false,
  submitSize: 'medium',
  submitText: '保存',
  menuPosition: 'center'
};
