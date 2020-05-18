const validateDateTime = (rule, value, callback) => {
  if (value && value < new Date().getTime()) {
    callback(new Error('时间不得小于当前时间'));
  } else {
    callback();
  }
};
let sessionRequestQuan = sessionStorage.getItem('requestQuantity');
let replyRequest = JSON.parse(sessionRequestQuan);
const validateNumber = (rule, value, callback) => {
  if (value && value > replyRequest) {
    callback(new Error('计划交货数量不可大于需求数量'));
  } else {
    callback();
  }
};
export default {
  data: [],
  page: {
    currentPage: 1,
    total: 0,
    pageSize: 10
  },
  option: {
    header: false,
    dialogDirection: 'rtl',
    dialogType: 'drawer',
    border: true,
    stripe: true,
    index: false,
    page: false,
    align: 'center',
    menu: true,
    menuAlign: 'center',
    menuWidth: '180',
    addBtn: false,
    editBtn: true,
    delBtn: false,
    refreshBtn: false,
    columnBtn: false,
    column: [
      {
        label: '订单项号',
        labelWidth: 120,
        prop: 'orderItemNumber',
        disabled: true
      },
      {
        label: '计划行号',
        labelWidth: 120,
        prop: 'deliveryItemNumber',
        disabled: true
      },
      {
        label: '要求交期',
        labelWidth: 120,
        prop: 'requestDeliveryDate',
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        disabled: true
      },
      {
        label: '需求数量',
        labelWidth: 120,
        prop: 'requestDeliveryQuantity',
        type: 'number',
        disabled: true
      },
      {
        label: '计划交货日期',
        labelWidth: 120,
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'timestamp',
        prop: 'replyDeliveryDate',
        rules: [{ trigger: 'change', validator: validateDateTime }]
      },
      {
        label: '计划交货数量',
        labelWidth: 120,
        prop: 'replyDeliveryQuantity',
        rules: [{ trigger: 'change', validator: validateNumber }]
      }
    ]
  }
};
