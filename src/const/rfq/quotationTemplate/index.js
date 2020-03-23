export default {
  data: [],
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
    viewBtn: true,
    delBtn: false,
    editBtn: false,
    indexLabel: '序号',
    border: true,
    highlightCurrentRow: true,
    index: true,
    column: [
      {
        label: '模板编号',
        prop: 'templateNo',
        display: false
      },
      {
        label: '模板名称',
        prop: 'templateName'
      },
      {
        label: '创建日期',
        prop: 'createTime',
        display: false
      },
      {
        label: '最新修改日期',
        prop: 'updateTime',
        display: false
      },
      {
        label: '创建人',
        prop: 'creator',
        display: false
      },
      {
        label: '备注',
        prop: 'mark'
      },
      {
        span: 24,
        formslot: true,
        prop: 'columns',
        label: '',
        labelWidth: 10
      }
    ]
  }
};
