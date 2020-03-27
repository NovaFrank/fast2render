export default {
  column: [
    {
      label: '供应商编号',
      span: 6,
      prop: 'toElsAccount'
    },
    {
      label: '供应商名称',
      span: 6,
      prop: 'toElsAccountName'
    },
    {
      label: '采购组',
      prop: 'purchaseGroup'
    },
    {
      label: '采购单号',
      prop: 'orderNumber',
      span: 6
    },
    {
      label: '负责人',
      prop: 'responsible',
      span: 6
    },
    {
      label: '采购类别',
      prop: 'purchaseType'
    }
  ],
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false,
  submitSize: 'medium',
  submitText: '保存',
  menuPosition: 'center'
};
