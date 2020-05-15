import { validateNumber } from '@/util/validate';

const validateQuantity = (rule, value, callback) => {
  console.log('value', validateNumber(value));
  if (!validateNumber(value)) {
    callback(new Error('请输入大于0的小数或整数'));
  } else {
    callback();
  }
};

export default {
  form: {
    ladderQuantity: ''
  },
  option: {
    menuSpan: 6,
    submitText: '添加',
    column: [
      {
        span: 10,
        label: '阶梯数量',
        prop: 'ladderQuantity',
        rules: [
          { required: true, message: '请输入阶梯数量', trigger: 'blur' },
          { trigger: 'change', validator: validateQuantity }
        ]
      }
    ]
  }
};
