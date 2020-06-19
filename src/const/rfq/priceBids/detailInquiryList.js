export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    align: 'center',
    menu: false,
    refreshBtn: false,
    columnBtn: false,
    addBtn: false,
    indexLabel: '#',
    border: true,
    index: true,
    fit: true,
    column: [
      { label: '物料编号', prop: 'materialNumber' },
      { label: '物料名称', prop: 'materialName' },
      { label: '单位', prop: 'baseUnit' },
      { label: '需求数量', prop: 'quantity' },
      { label: '对比项', prop: 'option' }
    ]
  }
};
