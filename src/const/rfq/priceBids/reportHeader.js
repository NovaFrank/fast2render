// const validateQuoteEndTime = (rule, value, callback) => {
//   if (value < new Date().getTime()) {
//     callback(new Error('截止时间不得小于当前时间'));
//   } else {
//     callback();
//   }
// };
export default {
  detail: true,
  labelWidth: 120,
  column: [
    {
      label: '提交人',
      span: 6,
      prop: 'createUser'
    },
    {
      label: '提交部门',
      span: 6,
      prop: 'submitDepartment'
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd HH:mm:ss',
      valueFormat: 'timestamp',
      label: '提交时间',
      span: 6,
      prop: 'createDate'
    }
  ]
};
