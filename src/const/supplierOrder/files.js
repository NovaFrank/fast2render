export default {
  data: [],
  option: {
    header: false,
    border: true,
    stripe: true,
    page: false,
    addBtn: true,
    align: 'center',
    menuAlign: 'center',
    menuWidth: '180',
    column: [
      {
        label: '文件ID',
        prop: 'profileID'
      },
      {
        label: '创建者',
        prop: 'creator'
      },
      {
        label: '创建人',
        prop: 'createPeople'
      },
      {
        label: '文件类型',
        prop: 'fileType'
      },
      {
        label: '行项目号',
        prop: 'lineNumber'
      }
    ]
  }
};
