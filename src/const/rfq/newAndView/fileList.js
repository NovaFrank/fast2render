export default {
  data: [
    {
      fileName: 'File 1',
      url: ''
    }
  ],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    refreshBtn: false,
    columnBtn: false,
    searchBtn: false,
    menu: true,
    menuAlign: 'left',
    addBtn: false,
    delBtn: false,
    editBtn: false,
    indexLabel: '#',
    border: true,
    highlightCurrentRow: true,
    index: true,
    column: [
      {
        label: '文件名称',
        prop: 'fileName'
      }
    ]
  }
};
