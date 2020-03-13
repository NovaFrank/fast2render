export default {
  column: [
    {
      type: 'select',
      label: '物料编号',
      prop: 'materialNo'
    },
    {
      label: '物料描述',
      prop: 'materialDesc'
    },
    {
      label: '规格',
      prop: 'standards'
    },
    {
      label: '单位',
      prop: 'unit'
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
      label: '要求交期',
      prop: 'requireTime'
    },
    {
      label: '需求数量',
      prop: 'count'
    },
    {
      label: 'ELS账号',
      prop: 'elsCount'
    },
    {
      type: 'select',
      label: '供应商',
      prop: 'supplier'
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
      label: '交货日期',
      prop: 'deadline'
    },
    {
      type: 'select',
      label: '报价方式',
      prop: 'quoteType'
    },
    {
      label: '设置成本报价',
      prop: 'setQuote'
    }
  ],
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false,
  submitSize: 'medium',
  submitText: '保存',
  menuPosition: 'center'
};
