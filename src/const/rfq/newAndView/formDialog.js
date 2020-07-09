import { validateNumber } from '@/util/validate';

// const validateDateTime = (rule, value, callback) => {
//   if (value && value < new Date().getTime()) {
//     callback(new Error('时间不得小于当前时间'));
//   } else {
//     callback();
//   }
// };
// const validateTaxRate = (rule, value, callback) => {
//   if (!validateNumber(value)) {
//     callback(new Error('请输入大于0的小数或整数'));
//   } else {
//     callback();
//   }
// };

const validateQuantity = (rule, value, callback) => {
  if (!validateNumber(value)) {
    callback(new Error('请输入大于0的小数或整数'));
  } else {
    callback();
  }
};

export default {
  column: [
    {
      formslot: true,
      type: 'tree',
      label: '物料编号',
      prop: 'materialNumber',
      rules: [{ required: true, message: '请选择物料编号' }]
    },
    // {
    //   type: 'date',
    //   format: 'yyyy-MM-dd',
    //   valueFormat: 'timestamp',
    //   label: '要求交期',
    //   prop: 'deliveryDate',
    //   rules: [{ trigger: 'change', validator: validateDateTime }]
    // },
    {
      label: '需求数量',
      prop: 'quantity',
      rules: [
        { required: true, message: '请填写需求数量', trigger: 'blur' },
        { trigger: 'change', validator: validateQuantity }
      ]
    },
    // {
    //   type: 'date',
    //   format: 'yyyy-MM-dd',
    //   valueFormat: 'timestamp',
    //   label: '交货日期',
    //   prop: 'canDeliveryDate',
    //   rules: [{ trigger: 'change', validator: validateDateTime }]
    // },
    {
      type: 'select',
      label: '税码',
      prop: 'taxCode',
      rules: [{ required: true, message: '请选择税码', trigger: 'blur' }]
    },
    {
      label: '税率',
      prop: 'taxRate',
      disabled: true
    },
    // {
    //   dicUrl: '/layout/dics/value/currency',
    //   dicMethod: 'get',
    //   type: 'select',
    //   label: '币别',
    //   prop: 'currency'
    // },
    {
      dicUrl: '/layout/dics/value/quoteMethod',
      dicMethod: 'get',
      type: 'select',
      label: '报价方式',
      prop: 'quoteMethod',
      rules: [{ required: true, message: '请选择报价方式', trigger: 'change' }]
    },
    {
      span: 24,
      formslot: true,
      label: '',
      prop: 'ladderPriceJson'
    }
  ],
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false
};
