const popBox = [
  {
    label: '物料',
    prop: 'materialNumber',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-material',
    func: 'selectedRowMaterails'
  },
  {
    label: '采购组',
    prop: 'purchaseGroup',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-purchase-group',
    func: 'saveSelected'
  },
  {
    label: '采购组织',
    prop: 'purchaseOrganization',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-purchase-organization',
    func: 'saveSelected'
  },
  {
    label: '供应商',
    prop: 'toElsAccount',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-supplier',
    func: 'saveSelected'
  },
  {
    label: '员工',
    prop: 'employee',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-employee',
    func: 'saveSelected'
  },
  {
    label: '采购工厂',
    prop: 'purchaseFactory',
    url: '/masterdata/material/#/masterdata/view/',
    component: 'fast2-select-factory',
    func: 'saveSelected'
  },
  {
    label: '订单',
    prop: 'orderNumber',
    url: '/order/#/view/',
    component: 'fast2-select-order',
    func: 'saveSelected'
  }
];
export default popBox;
