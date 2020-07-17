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
    menuAlign: 'left',
    indexLabel: '序号',
    border: true,
    highlightCurrentRow: true,
    index: true,
    searchLabelWidth: 140,
    searchMenuSpan: 6,
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
      // {
      //   slot: true,
      //   label: '状态',
      //   prop: 'status'
      // },
      {
        label: '供应商ELS账号',
        prop: 'toElsAccount',
        search: true
      },
      {
        label: '供应商名称',
        prop: 'companyShortName'
      },
      {
        slot: true,
        label: '物料编码',
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
      {
        type: 'select',
        label: '询价类型',
        prop: 'enquiryType'
      },
      {
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
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
        label: '数量',
        prop: 'quantity'
      },
      // {
      //   type: 'date',
      //   format: 'yyyy-MM-dd',
      //   valueFormat: 'timestamp',
      //   label: '交货日期',
      //   prop: 'canDeliveryDate'
      // },
      {
        label: '创建人',
        prop: 'createUser'
      }
    ]
  }
};
