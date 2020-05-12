// 注册信息字段、资质准入字段 dialog
// import { DIC } from '../../dic';

const validateQuoteEndTime = (rule, value, callback) => {
  if (value < new Date().getTime()) {
    callback(new Error('截至时间不得小于当前时间'));
  } else {
    callback();
  }
};

export default {
  column: [
    {
      type: 'input',
      label: '询价名称',
      span: 6,
      prop: 'enquiryDesc'
    },
    // {
    //   type: 'date',
    //   format: 'yyyy-MM-dd',
    //   valueFormat: 'timestamp',
    //   label: '询价日期',
    //   span: 6,
    //   prop: 'beginDate',
    //   rules: [
    //     {
    //       required: true,
    //       message: '请选择询价日期',
    //       trigger: 'blur'
    //     }
    //   ]
    // },
    // 公司代码 - 默认
    {
      type: 'tree',
      label: '公司代码',
      span: 6,
      prop: 'companyCode',
      valueDefault: ''
    },
    {
      type: 'datetime',
      format: 'yyyy-MM-dd hh:mm:ss',
      valueFormat: 'timestamp',
      label: '报价截止时间',
      span: 6,
      prop: 'quoteEndTime',
      rules: [
        {
          required: true,
          message: '请选择报价截止时间',
          trigger: 'blur'
        },
        { trigger: 'blur', validator: validateQuoteEndTime }
      ]
    },
    {
      type: 'select',
      // dicData: DIC.TABLE_CONFIG_DEFAULT,
      dicUrl: '/layout/dics/value/enquiryType',
      dicMethod: 'get',
      label: '询价类型',
      span: 6,
      prop: 'enquiryType',
      rules: [
        {
          required: true,
          message: '请选择询价类型',
          trigger: 'blur'
        }
      ]
    }
    // Test
    // {
    //   label: '数据类型',
    //   span: 12,
    //   labelPosition: 'top',
    //   prop: 'datatype',
    //   type: 'select',
    //   dicUrl: '/layout/dics/value/data_type',
    //   dicMethod: 'get'
    // },
    // {
    //   type: 'tree',
    //   label: '负责人',
    //   span: 6,
    //   prop: 'responsible',
    //   rules: [
    //     {
    //       required: true,
    //       message: '请选择负责人',
    //       trigger: 'blur'
    //     }
    //   ]
    // },
    // {
    //   type: 'select',
    //   // dicData: DIC.ENQUIRY_METHOD,
    //   dicUrl: '/layout/dics/value/enquiryMethod',
    //   dicMethod: 'get',
    //   label: '公开方式',
    //   span: 6,
    //   prop: 'enquiryMethod',
    //   rules: [
    //     {
    //       required: true,
    //       message: '请选择公开方式',
    //       trigger: 'blur'
    //     }
    //   ]
    // }
  ],
  labelWidth: 120,
  menuBtn: false
};
