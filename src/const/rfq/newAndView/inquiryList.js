export default {
  data: [
    {
      uuid: 0,
      materialNo: 'materialNo0',
      materialDesc: 'materialDesc0',
      standards: 'standards',
      unit: 'unit',
      elsCount: 'elsCount0',
      supplier: 'supplier0',
      $cellEdit: true
    },
    {
      uuid: 1,
      materialNo: 'materialNo0',
      materialDesc: 'materialDesc0',
      standards: 'standards',
      unit: 'unit',
      elsCount: 'elsCount1',
      supplier: 'supplier1',
      $cellEdit: true
    },
    {
      uuid: 2,
      materialNo: 'materialNo1',
      materialDesc: 'materialDesc1',
      standards: 'standards',
      unit: 'unit',
      elsCount: 'elsCount1',
      supplier: 'supplier1',
      $cellEdit: true
    }
  ],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
    searchBtn: false,
    menu: false,
    menuAlign: 'left',
    delBtn: false,
    indexLabel: '#',
    border: true,
    // highlightCurrentRow: true,
    index: true,
    keyId: 'uuid',
    editBtn: false,
    cellBtn: true,
    fit: true,
    column: [
      {
        label: '物料编号',
        prop: 'materialNo'
      },
      {
        label: '物料描述',
        prop: 'materialDesc'
      },
      {
        label: '规格',
        prop: 'standards'
      },
      {
        label: '单位',
        prop: 'unit',
        span: 4
      },
      // {
      //   label: '要求交期',
      //   prop: 'requireTime'
      // },
      // {
      //   label: '需求数量',
      //   prop: 'count'
      // },
      {
        label: 'ELS账号',
        prop: 'elsCount'
      },
      {
        label: '供应商',
        prop: 'supplier'
      },
      {
        label: '税率',
        prop: 'taxRate'
      },
      {
        label: '报价',
        prop: 'price'
      },
      {
        label: '交货日期',
        prop: 'deadline'
      },
      {
        slot: true,
        label: '操作',
        prop: 'option'
      },
      {
        label: '配额',
        prop: 'quote',
        cell: true
      }
    ]
  }
};
