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
          {
            required: true,
            message: '请输入阶梯数量',
            trigger: 'blur'
          }
        ]
      }
    ]
  }
};
