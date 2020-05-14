import { validatenum, validatenumord } from '@/util/validate';

const validateDateTime = (rule, value, callback) => {
  if (value && value < new Date().getTime()) {
    callback(new Error('时间不得小于当前时间'));
  } else {
    callback();
  }
};
const validateTaxRate = (rule, value, callback) => {
  if (!validatenum(validatenum) || !validatenumord(value)) {
    callback(new Error('请输入大于0的小数或整数'));
  } else {
    callback();
  }
};

export default {
  column: [
    {
      type: 'tree',
      label: '物料编号',
      prop: 'materialNumber',
      rules: [{ required: true, message: '请选择物料编号', trigger: 'blur' }]
    },
    // {
    //   label: '物料名称',
    //   prop: 'materialName'
    // },
    // {
    //   label: '物料描述',
    //   prop: 'materialDesc'
    // },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
      label: '要求交期',
      prop: 'deliveryDate',
      rules: [{ trigger: 'change', validator: validateDateTime }]
    },
    {
      label: '需求数量',
      prop: 'quantity',
      rules: [{ required: true, message: '请填写需求数量', trigger: 'change' }]
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
      label: '交货日期',
      prop: 'canDeliveryDate',
      rules: [{ trigger: 'change', validator: validateDateTime }]
    },
    {
      dicUrl: '/layout/dics/value/taxCode',
      dicMethod: 'get',
      type: 'select',
      label: '税码',
      prop: 'taxCode'
    },
    {
      label: '税率',
      prop: 'taxRate',
      disabled: true,
      rules: [{ trigger: 'blur', validator: validateTaxRate }]
    },
    {
      type: 'tree',
      label: '币别',
      prop: 'currency'
    },
    {
      dicUrl: '/layout/dics/value/enquiryMethod',
      dicMethod: 'get',
      type: 'select',
      label: '报价方式',
      prop: 'quoteMethod', // 0、1
      rules: [{ required: true, message: '请选择报价方式', trigger: 'change' }]
    },
    {
      span: 24,
      formslot: true,
      label: '',
      prop: 'ladderPriceJson'
    }
    // {
    //   type: 'tree',
    //   span: 24,
    //   label: '供应商',
    //   prop: 'toElsAccountList',
    //   multiple: true
    //   // formslot: true
    // },
  ],
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false
};
