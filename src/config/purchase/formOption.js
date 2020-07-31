import { Validator } from '@/util/validator';

import { validateNumber } from '@/util/validate';

const validateQuantity = (rule, value, callback) => {
  if (!validateNumber(value)) {
    callback(new Error('请输入大于0的小数或整数'));
  } else {
    callback();
  }
};

export const materialColumnOption = [
  {
    label: '物料编码',
    prop: 'materialNumber',
    formslot: true,
    rules: [
      {
        required: true,
        message: '请输入 物料编码',
        trigger: 'blur'
      }
    ]
  },
  {
    label: '物料描述',
    prop: 'materialDesc',
    disabled: true
  },
  {
    label: '订单行号',
    prop: 'orderItemNumber',
    addDisplay: false,
    editDisplay: false
  },
  {
    label: '计划行号',
    prop: 'deliveryItemNumber',
    addDisplay: false,
    editDisplay: false,
    hide: true
  },
  {
    label: '规格',
    prop: 'materialSpecifications',
    addDisplay: false,
    editDisplay: false
  },
  {
    label: '单位',
    prop: 'baseUnit',
    addDisplay: false,
    editDisplay: false
  },
  {
    label: '需求数量',
    prop: 'quantity',
    type: 'number',
    rules: [
      {
        required: true,
        message: '请输入 大于0的需求数量',
        trigger: 'blur',
        validator: validateQuantity
      }
    ]
  },
  {
    label: '税码',
    prop: 'taxCode',
    dicData: [
      { id: 357, label: '001', value: '0.01' },
      { id: 358, label: '002', value: '0.02' },
      { id: 452, label: '0', value: '0' }
    ],
    // dicUrl: '/layout/dics/value/taxCode',
    // dicMethod: 'get',
    type: 'select',
    rules: [
      {
        required: true,
        message: '请输入 税码',
        trigger: 'blur'
      }
    ]
  },
  {
    label: '税率',
    prop: 'taxRate',
    type: 'input',
    disabled: true
    // rules: [{ trigger: 'blur', validator: validateTaxRate }]
  },
  {
    label: '含税单价',
    prop: 'priceIncludingTax',
    type: 'number',
    precision: 2,
    rules: [
      {
        required: true,
        message: '请输入 大于0的含税单价',
        trigger: 'blur',
        validator: validateQuantity
      }
    ]
  },
  {
    label: '总金额',
    prop: 'totalAmount',
    type: 'number',
    precision: 2,
    addDisplay: false,
    editDisplay: false
  },
  {
    label: 'ELS账号',
    prop: 'elsAccount',
    addDisplay: false,
    editDisplay: false
  },
  {
    label: '供应商',
    prop: 'toElsAccount',
    addDisplay: false,
    editDisplay: false
  },
  {
    label: '交货日期',
    type: 'date',
    format: 'yyyy-MM-dd',
    valueFormat: 'timestamp',
    prop: 'deliveryDate',
    rules: [
      {
        required: true,
        message: '请输入 交货日期',
        trigger: 'blur'
      }
    ]
  }
];

// 应用于 新的配置页面 begin
export const MATERIAL_LIST_OPTION = {
  data: [],
  obj: {},
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  exclude: {
    span: true
  },
  option: {
    dialogDirection: 'rtl',
    dialogType: 'drawer',
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
    searchBtn: true,
    menu: true,
    page: false,
    menuAlign: 'left',
    indexLabel: '#',
    index: true,
    border: true,
    highlightCurrentRow: true,
    column: materialColumnOption
  }
};

export const MATERIAL_COLUMN_ITEMS = {};

export const MATERIAL_COLUMN_ITEMS_BAK = {
  materialNumber: {
    label: '物料编码',
    prop: 'materialNumber',
    editDisabled: false,
    formslot: true,
    rules: [
      {
        required: true,
        message: '请输入 物料编码',
        trigger: 'blur'
      }
    ]
  },
  materialDesc: {
    label: '物料描述',
    prop: 'materialDesc',
    disabled: true
  },
  orderItemNumber: {
    label: '订单行号',
    prop: 'orderItemNumber',
    addDisplay: false,
    editDisplay: false
  },
  materialSpecifications: {
    label: '规格',
    prop: 'materialSpecifications',
    addDisplay: false,
    editDisplay: false
  },
  baseUnit: {
    label: '单位',
    prop: 'baseUnit',
    addDisplay: false,
    editDisplay: false
  },
  quantity: {
    label: '需求数量',
    prop: 'quantity',
    placeholder: '请输入 需求数量',
    rules: [
      {
        required: true,
        message: '请输入 需求数量',
        trigger: 'blur'
      },
      { validator: Validator.isPositiveNumber, trigger: 'blur' }
    ]
  },
  taxCode: {
    label: '税码',
    prop: 'taxCode',
    dicData: [
      { id: 357, label: '001', value: '0.01' },
      { id: 358, label: '002', value: '0.02' },
      { id: 452, label: '0', value: '0' }
    ]
  },
  taxRate: {
    label: '税率',
    prop: 'taxRate',
    type: 'input',
    disabled: true
  },

  priceIncludingTax: {
    label: '含税单价',
    prop: 'priceIncludingTax',
    type: 'number',
    precision: 2,
    rules: [
      {
        required: true,
        message: '请输入 大于0的含税单价',
        trigger: 'blur',
        validator: validateQuantity
      }
    ]
  },
  totalAmount: {
    label: '总金额',
    prop: 'totalAmount',
    type: 'number',
    precision: 2,
    addDisplay: false,
    editDisplay: false
  },
  deliveryDate: {
    label: '交货日期',
    type: 'date',
    format: 'yyyy-MM-dd',
    valueFormat: 'timestamp',
    prop: 'deliveryDate',
    rules: [
      {
        required: true,
        message: '请输入 交货日期',
        trigger: 'blur'
      }
    ]
  }
};
// 应用于 新的配置页面 end
