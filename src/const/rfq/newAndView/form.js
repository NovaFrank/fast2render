// 注册信息字段、资质准入字段 dialog
import { DIC } from '../../dic';

const validateQuoteEndTime = (rule, value, callback) => {
  if (value && value < new Date().getTime()) {
    callback(new Error('截止时间不得小于当前时间'));
  } else {
    callback();
  }
};

export default {
  column: [
    {
      formslot: true,
      type: 'input',
      label: '询价单号',
      span: 6,
      prop: 'enquiryNumber'
    },
    {
      type: 'input',
      label: '询价名称',
      span: 6,
      prop: 'enquiryDesc'
    },
    {
      type: 'tree',
      label: '工厂代码',
      span: 6,
      prop: 'companyCode',
      valueDefault: ''
    },
    {
      type: 'datetime',
      format: 'yyyy-MM-dd HH:mm:ss',
      valueFormat: 'timestamp',
      label: '提交截止时间',
      span: 6,
      prop: 'quoteEndTime',
      rules: [
        { required: true, message: '请选择提交截止时间', trigger: 'change' },
        { trigger: 'change', validator: validateQuoteEndTime }
      ]
    },
    {
      type: 'select',
      formslot: true,
      label: '询价类型',
      span: 6,
      prop: 'enquiryType',
      rules: [
        {
          required: true,
          message: '请选择询价类型',
          trigger: 'change'
        }
      ]
    },
    {
      type: 'select',
      dicData: DIC.CHECK_RULE,
      label: '查看规则',
      span: 6,
      prop: 'canSeeRule',
      value: '0',
      rules: [
        {
          required: true,
          message: '请选择查看规则',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'input',
      label: '开启密码',
      span: 6,
      prop: 'passWord',
      maxlength: 8,
      showWordLimit: true
    }
  ],
  labelWidth: 120,
  menuBtn: false
};
