export default {
  data: [],
  option: {
    header: false,
    menuAlign: 'left',
    editBtn: false,
    indexLabel: '#',
    border: true,
    highlightCurrentRow: true,
    index: true,
    fit: true,
    column: [
      {
        span: 24,
        label: '阶梯数量',
        prop: 'ladderQuantity',
        rules: [
          {
            required: true,
            message: '请输入阶梯数量',
            trigger: 'blur'
          }
        ]
      },
      {
        addDisplay: false,
        label: '阶梯级',
        prop: 'ladderGrade'
      }
    ]
  }
};
