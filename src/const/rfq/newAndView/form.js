// 注册信息字段、资质准入字段 dialog
import { DIC } from '../../dic';

export default {
  column: [
    {
      type: 'select',
      dicData: DIC.TABLE_CONFIG_DEFAULT,
      label: '询价类型',
      span: 6,
      prop: 'formBusiness',
      valueDefault: ''
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
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
      label: '截止日期',
      span: 6,
      prop: 'quoteDeadline'
    },
    {
      type: 'input',
      label: '负责人',
      span: 6,
      prop: 'inCharge'
    },
    {
      type: 'input',
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
