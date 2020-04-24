// 注册信息字段、资质准入字段 dialog
import { DIC } from '../../dic';

export default {
  column: [
    {
      formslot: true,
      type: 'text',
      label: '询价单号',
      span: 6,
      prop: 'no',
      value: '待生成'
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
      type: 'select',
      dicData: DIC.TABLE_CONFIG_DEFAULT,
      label: '询价类型',
      span: 6,
      prop: 'formBusiness',
      valueDefault: ''
    },
    {
      type: 'select',
      dicData: DIC.TABLE_CONFIG_DEFAULT,
      label: '公司代码',
      span: 6,
      prop: 'companyCode',
      valueDefault: ''
    },
    {
      type: 'input',
      label: '负责人',
      span: 6,
      prop: 'inCharge'
    },
    {
      type: 'select',
      dicData: DIC.TABLE_CONFIG_DEFAULT,
      label: '公开方式',
      span: 6,
      prop: 'type',
      valueDefault: ''
    }
  ],
  menuBtn: false
};
