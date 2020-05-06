export default {
  column: [
    {
      type: 'tree',
      label: '物料编号',
      prop: 'materialNumber',
      rules: [
        {
          required: true,
          message: '请选择物料编号',
          trigger: 'blur'
        }
      ]
    },
    // {
    //   label: '物料名称',
    //   prop: 'materialName'
    // },
    // {
    //   label: '物料描述',
    //   prop: 'materialDesc'
    // },
    // {
    //   label: '规格',
    //   prop: 'materialSpecifications'
    // },
    // {
    //   label: '单位',
    //   prop: 'baseUnit '
    // },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
      label: '要求交期',
      prop: 'deliveryDate'
    },
    {
      label: '需求数量',
      prop: 'quantity'
    },
    {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
      label: '交货日期',
      prop: 'canDeliveryDate'
    },
    {
      dicUrl: '/layout/dics/value/enquiryMethod',
      dicMethod: 'get',
      type: 'select',
      label: '报价方式',
      prop: 'quoteMethod' // 0、1
    },
    {
      span: 24,
      formslot: true,
      label: '',
      prop: 'ladderPriceJson'
    }
    // {
    //   type: 'tree',
    //   span: 24,
    //   label: '供应商',
    //   prop: 'toElsAccountList',
    //   multiple: true
    //   // formslot: true
    // },
  ],
  menuBtn: true,
  emptyBtn: false,
  submitBtn: false
};
