export default {
  form: {
    ladderQuantity: ''
  },
  option: {
    submitBtn: false,
    emptyBtn: false,
    labelWidth: 0,
    column: [
      {
        span: 24,
        label: '',
        prop: 'password',
        placeholder: '请输入 密码',
        rules: [
          {
            required: true,
            message: '请输入 密码',
            trigger: 'blur'
          }
        ]
      }
    ]
  }
};
