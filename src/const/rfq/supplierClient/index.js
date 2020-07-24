export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    refreshBtn: false,
    align: 'center',
    addBtn: false,
    menu: false,
    menuAlign: 'rigth',
    indexLabel: '序号',
    border: true,
    highlightCurrentRow: true,
    index: true,
    searchLabelWidth: 140,
    searchShow: false,
    selectable: (row, index) => {
      console.log(row, index);
    },
    column: [
      {
        slot: true,
        label: '询价单号',
        prop: 'enquiryNumber',
        width: '140',
        search: true
      },
      {
        label: '物料编号',
        prop: 'materialNumber',
        search: true
      },
      {
        label: '物料名称',
        prop: 'materialName'
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      // {
      //   dicUrl: '/layout/dics/value/enquiryMethod',
      //   dicMethod: 'get',
      //   type: 'select',
      //   label: '报价方式',
      //   prop: 'quoteMethod'
      // },
      {
        label: '需求数量',
        prop: 'quantity'
      },
      {
        type: 'select',
        label: '询价类型',
        prop: 'enquiryType',
        search: true
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        label: '询价日期',
        prop: 'createDate'
      },
      {
        type: 'datetime',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'timestamp',
        label: '提交截止时间',
        prop: 'quoteEndTime'
      },
      {
        label: '采购负责人',
        prop: 'createUser'
      },
      {
        label: '采购商名称',
        prop: 'createUser'
      },
      {
        slot: true,
        label: '状态',
        prop: 'itemStatus'
      }
    ]
  }
};
